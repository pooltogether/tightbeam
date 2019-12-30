import { ContractCache } from '../ContractCache'
import { ProviderSource } from '../types'
import { sendTransactionResolver } from './mutations'

/**
 * 
 * @param tightbeam The Tightbeam object
 */
export function bindMutationResolvers(contractCache: ContractCache, providerSource: ProviderSource) {
  let nextTxId = 1

  return {
    sendTransaction: function (opts, args, context, info) {
      return sendTransactionResolver(contractCache, providerSource, nextTxId++, opts, args, context, info)
    }
  }
}