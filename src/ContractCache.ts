import { AbiMapping } from './abis/AbiMapping'
import { Interface } from 'ethers/utils/interface'
import { Contract } from 'ethers/contract'
import { ProviderSource } from './types/ProviderSource'

const debug = require('debug')('tightbeam:ContractCache')

/**
 * Look up contracts or ABIs by name or address.  Values are cached.  Also offers a contract resolver to easily retrieve an [[ethers.Contract]] object.
 */
export class ContractCache {
  contractCache: Map<number, Map<string, Contract>>
  ifaceCache: Map<number, Map<string, Interface>>

  constructor (
    public readonly abiMapping: AbiMapping,
    public readonly providerSource: ProviderSource
  ) {
    if (!abiMapping) {
      throw new Error('abiMapping must be defined')
    }
    if (!providerSource) {
      throw new Error('provider source must be defined')
    }
    this.contractCache = new Map<number, Map<string, Contract>>()
    this.ifaceCache = new Map<number, Map<string, Interface>>()
  }

  /**
   * Lookup a contract by name.  
   * 
   * @param contractName The contract name used to register the contract in the [[AbiMapping]]
   */
  async getContractByName (contractName: string): Promise<Contract> {
    if (!contractName) throw new Error('Contract name must be defined')

    const provider = await this.providerSource()
    const network = await provider.getNetwork()
    const { chainId } = network

    let address = this.abiMapping.getContractAddress(contractName, chainId)

    if (!address) {
      throw new Error(`Cannot find address for ${contractName} and chain id ${chainId}`)
    }
    
    return await this.getContractByAddress(address)
  }

  /**
   * Lookup a contract by address
   * 
   * @param address The address that the contract was added under in the [[AbiMapping]]
   */
  async getContractByAddress (address: string): Promise<Contract> {
    if (!address) throw new Error('Address must be defined')

    const provider = await this.providerSource()
    const network = await provider.getNetwork()
    const { chainId } = network
    
    if (!this.contractCache[chainId]) {
      this.contractCache[chainId] = {}
    }

    let contract = this.contractCache[chainId][address]
    if (!contract) {
      const abiDef = this.abiMapping.getContractAbiDefinitionByAddress(address, chainId)
      if (!abiDef) {
        throw new Error(`Could not find contract for address ${address} and chain id ${chainId}`)
      }
      contract = new Contract(address, abiDef.abi, provider)
      this.contractCache[chainId][address] = contract
    }
    return contract
  }

  /**
   * Lookup an [[ethers.utils.Interface]] by abi name
   * 
   * @param abiName The name of the ABI added in the [[AbiMapping]]
   */
  async getAbiInterfaceByName (abiName): Promise<Interface> {
    let iface = this.ifaceCache[abiName]
    if (!iface) {
      const abi: any = this.abiMapping.getAbiDefinition(abiName)
      if (!abi) {
        throw new Error(`Could not find abi for name ${abiName}`)
      }
      iface = new Interface(abi)
      this.ifaceCache[abiName] = iface
    }
    debug(`getInterface(${abiName}): `, iface)
    return iface
  }

  async resolveContract({ abi, address, contractName }): Promise<Contract> {
    let contract: Contract
    const provider = await this.providerSource()
    if (abi) {
      let ethersInterface = await this.getAbiInterfaceByName(abi)
      if (!address) {
        throw new Error(`abi ${abi} selected but no address passed`)
      }
      contract = new Contract(address, ethersInterface.abi, provider)
    } else if (address) {
      contract = await this.getContractByAddress(address)
    } else if (contractName) {
      contract = await this.getContractByName(contractName)
    }

    return contract
  }
}
