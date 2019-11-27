import { Provider } from 'ethers/providers'
import { AbiMapping } from './abis/AbiMapping'
import { Interface } from 'ethers/utils/interface'
import { Contract } from 'ethers/contract'

const debug = require('debug')('tightbeam:ContractCache')

class ContractCacheOptions {
  abiMapping: AbiMapping
  provider: () => Promise<Provider>
}

class ResolutionResult {
  ethersInterface: Interface
  address: string
  identifier: string
}

export class ContractCache {
  provider: () => Promise<Provider>
  abiMapping: AbiMapping
  contractCache: Map<number, Map<string, Contract>>
  ifaceCache: Map<number, Map<string, Interface>>

  constructor (options: ContractCacheOptions) {
    if (!options.abiMapping) {
      throw new Error('abiMapping must be defined')
    }
    if (!options.provider) {
      throw new Error('provider must be defined')
    }
    this.provider = options.provider
    this.abiMapping = options.abiMapping
    this.contractCache = new Map<number, Map<string, Contract>>()
    this.ifaceCache = new Map<number, Map<string, Interface>>()
  }

  async getContractByName (contractName: string): Promise<Contract> {
    if (!contractName) throw new Error('Contract name must be defined')

    const provider = await this.provider()
    const network = await provider.getNetwork()
    const { chainId } = network

    let address = this.abiMapping.getContractAddress(contractName, chainId)

    if (!address) {
      throw new Error(`Cannot find address for ${contractName} and chain id ${chainId}`)
    }
    
    return await this.getContractByAddress(address)
  }

  async getContractByAddress (address: string): Promise<Contract> {
    if (!address) throw new Error('Address must be defined')

    const provider = await this.provider()
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
    const provider = await this.provider()
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
