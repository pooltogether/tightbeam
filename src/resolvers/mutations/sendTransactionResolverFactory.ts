import { sendTransactionResolver } from './sendTransactionResolver'
import { ContractCache } from '../../ContractCache'
import { ProviderSource } from '../../types/ProviderSource'

let nextTxId = 1

export function sendTransactionResolverFactory(contractCache: ContractCache, providerSource: ProviderSource) {
  return function (opts, args, context, info) {
    return sendTransactionResolver(contractCache, providerSource, nextTxId++, opts, args, context, info)
  }
}
