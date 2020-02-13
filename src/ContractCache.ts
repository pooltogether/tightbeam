import { ethers } from 'ethers'

import { AbiMapping } from './abis/AbiMapping'
import { ProviderSource } from './types/ProviderSource'
import { normalizeAddress } from './utils/normalizeAddress'
import { AbiDefinition } from './abis'

const debug = require('debug')('tightbeam:ContractCache')

interface ResolveContractOptions {
  abi?: string
  name?: string
  contract?: string
  address?: string
}

function error(message): void {
  debug(message)
  throw new Error(message)
}

/**
 * Look up contracts or ABIs by name or address.  Values are cached.  Also offers a contract resolver to easily retrieve an [[ethers.Contract]] object.
 */
export class ContractCache {
  contractCache: Map<number, Map<string, ethers.Contract>>
  ifaceCache: Map<number, Map<string, ethers.utils.Interface>>

  constructor (
    public readonly abiMapping: AbiMapping,
    public readonly providerSource: ProviderSource
  ) {
    if (!abiMapping) {
      error('constructor: abiMapping must be defined')
    }
    if (!providerSource) {
      error('constructor: provider source must be defined')
    }
    this.contractCache = new Map<number, Map<string, ethers.Contract>>()
    this.ifaceCache = new Map<number, Map<string, ethers.utils.Interface>>()
  }

  /**
   * Lookup a contract by name.  
   * 
   * @param contractName The contract name used to register the contract in the [[AbiMapping]]
   */
  async getContractByName (contractName: string): Promise<ethers.Contract> {
    if (!contractName) error('Contract name must be defined')
    const chainId = await this.getChainId()
    let address = this.abiMapping.getContractAddress(contractName, chainId)
    if (!address) {
      error(`Cannot find address for ${contractName} and chain id ${chainId}`)
    }
    return await this.getContractByAddress(address)
  }

  async getChainId(): Promise<number> {
    const provider = await this.providerSource()
    const network = await provider.getNetwork()
    const { chainId } = network
    return chainId
  }

  /**
   * Lookup a contract by address
   * 
   * @param address The address that the contract was added under in the [[AbiMapping]]
   */
  async getContractByAddress (address: string, abi?: string): Promise<ethers.Contract> {
    if (!address) error('Address must be defined')

    const chainId = await this.getChainId()
    
    if (!this.contractCache[chainId]) {
      this.contractCache[chainId] = {}
    }

    address = normalizeAddress(address)

    let contract = this.contractCache[chainId][address]
    if (!contract) {
      let abiDef: AbiDefinition
      if (abi) {
        abiDef = await this.abiMapping.getAbiDefinition(abi)
        if (!abiDef) {
          error(`Could not find abi with name '${abi}'`)
        }
      } else {
        abiDef = this.abiMapping.getContractAbiDefinitionByAddress(address, chainId)
        if (!abiDef) {
          error(`Could not find abi for address '${address}' and chain id '${chainId}'`)
        }
      }
      const provider = await this.providerSource()
      contract = new ethers.Contract(address, abiDef.abi, provider)
      this.contractCache[chainId][address] = contract
    }
    return contract
  }

  /**
   * Lookup an [[ethers.utils.Interface]] by abi name
   * 
   * @param abiName The name of the ABI added in the [[AbiMapping]]
   */
  async getAbiInterfaceByName (abiName): Promise<ethers.utils.Interface> {
    let iface = this.ifaceCache[abiName]
    if (!iface) {
      const abiDef = this.abiMapping.getAbiDefinition(abiName)
      if (!abiDef) {
        error(`Could not find abi with name ${abiName}`)
      }
      iface = new ethers.utils.Interface(abiDef.abi)
      this.ifaceCache[abiName] = iface
    }
    return iface
  }

  async resolveContract(resolveContractOptions: ResolveContractOptions): Promise<ethers.Contract> {
    let { abi, address, name, contract } = resolveContractOptions

    let contractName = name || contract

    address = normalizeAddress(address)

    let result
    if (address) {
      result = await this.getContractByAddress(address, abi)
    } else if (contractName) {
      result = await this.getContractByName(contractName)
    } else if (abi) {
      error(`abi '${abi}' selected but no address passed`)
    } else {
      error(`abi, address or contract must be defined`)
    }
    return result
  }
}
