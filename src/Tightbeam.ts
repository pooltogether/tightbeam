import * as abis from './abis'
import * as queries from './queries'
import * as resolvers from './resolvers'
import * as services from './services'
import * as subscribers from './subscribers'
import * as types from './types'
import * as utils from './utils'

export * from './ContractCache'

export {
  abis,
  queries,
  resolvers,
  services,
  subscribers,
  types,
  utils
}

import { ContractCache } from './ContractCache'
import { AbiMapping } from './abis/AbiMapping'
import { ProviderSource } from './types/ProviderSource'
import { ethers } from 'ethers'
import { bindResolvers } from './resolvers/bindResolvers'
import { EventFilter } from './types'
import { eventSubscriber } from './subscribers'

const merge = require('lodash.merge')

export interface TightbeamOptions {
  abiMapping?: AbiMapping
  providerSource?: ProviderSource,
  txProviderSource?: ProviderSource,
  defaultFromBlock?: number
}

export class Tightbeam {
  public contractCache: ContractCache
  public txContractCache: ContractCache
  public abiMapping: AbiMapping
  public providerSource: ProviderSource
  public txProviderSource: ProviderSource
  public defaultFromBlock: number

  constructor (
    options?: TightbeamOptions
  ) {
    const { 
      providerSource,
      txProviderSource,
      abiMapping,
      defaultFromBlock
    } = options || {}
    this.providerSource = providerSource || (async () => ethers.getDefaultProvider())
    this.txProviderSource = txProviderSource || this.providerSource
    this.abiMapping = abiMapping || new AbiMapping()
    this.defaultFromBlock = defaultFromBlock || 0
    this.contractCache = new ContractCache(this.abiMapping, this.providerSource)
    this.txContractCache = new ContractCache(this.abiMapping, this.txProviderSource)
  }

  resolvers (clientResolvers = {}) {
    return merge(clientResolvers, this.bindResolvers())
  }

  async subscribeEvent (eventFilter: EventFilter) {
    return await eventSubscriber(this.contractCache, this.providerSource, this.defaultFromBlock, eventFilter)      
  }

  bindResolvers () {
    return bindResolvers(this)
  }

  defaultCacheData(otherState = {}) {
    return merge(otherState, 
      {
        data: {
          transactions: []
        }
      }
    )
  }
}