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
import { eventSubscriber, EventSubscriptionManager, BlockSubscriptionManager } from './subscribers'
import Observable from 'zen-observable-ts'
import { Log } from 'ethers/providers'

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

  private blockSubscriptionManager: BlockSubscriptionManager
  private eventSubscriptionManager: EventSubscriptionManager

  private logsSubscriber: Observable<Array<Log>>

  private subscribersReady: Promise<void>

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
    this.blockSubscriptionManager = new BlockSubscriptionManager(this.providerSource)
    this.eventSubscriptionManager = new EventSubscriptionManager(this.providerSource, this.blockSubscriptionManager)
  }

  resolvers (clientResolvers = {}) {
    return merge(clientResolvers, this.bindResolvers())
  }

  async subscribeEvent (eventFilter: EventFilter) {
    await this.startSubscribers()
    return await eventSubscriber(this.contractCache, this.logsSubscriber, eventFilter)
  }

  async startSubscribers() {
    if (!this.subscribersReady) {
      this.subscribersReady = new Promise((resolve, reject) => {
        const setup = async () => {
          this.blockSubscriptionManager.start()
          this.eventSubscriptionManager.start()
          this.logsSubscriber = await this.eventSubscriptionManager.subscribe()
        }
        setup().then(resolve).catch(reject)
      })
    }
    return await this.subscribersReady
  }

  bindResolvers () {
    return bindResolvers(this)
  }

  defaultCacheData(otherState = {}) {
    return merge(otherState, 
      {
        data: {
          _transactions: []
        }
      }
    )
  }
}