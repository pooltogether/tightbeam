import * as queries from './queries'
import { ContractCache } from '../ContractCache'
import { ProviderSource } from '../types'

/**
 * 
 * @param tightbeam The Tightbeam object
 * @returns A map of the query resolvers.
 */
export function bindQueryResolvers(contractCache: ContractCache, providerSource: ProviderSource, txProviderSource: ProviderSource, defaultFromBlock: number) {
  return {
    account: function () {
      return queries.accountResolver(txProviderSource) 
    },
    block: function (opts, args, context, info) {
      return queries.blockResolver(
        providerSource,
        opts,
        args,
        context,
        info
      ) 
    },
    call: function (opts, args, context, info) {
      return queries.callResolver(
        contractCache,
        providerSource,
        opts,
        args,
        context,
        info
      ) 
    },
    contract: function (opts, args, context, info) {
      return queries.contractResolver(
        contractCache,
        opts,
        args,
        context,
        info
      )
    },
    network: function () {
      return queries.networkResolver(providerSource) 
    },
    pastEvents: function (opts, args, context, info) {
      return queries.pastEventsResolver(
        contractCache,
        providerSource,
        defaultFromBlock,
        opts,
        args,
        context,
        info
      )
    },
    transaction: function (opts, args, context, info) {
      return queries.transactionResolver(
        opts,
        args,
        context,
        info
      )
    },
    transactions: function (opts, args, context, info) {
      return queries.transactionsResolver(
        opts,
        args,
        context,
        info
      )
    }
  }
}
