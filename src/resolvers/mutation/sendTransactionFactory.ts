import { ethers } from 'ethers'
import { sendTransaction } from './sendTransaction'
import { ContractCache } from '../../ContractCache'

let nextTxId = 1

export function sendTransactionFactory(contractCache: ContractCache, provider: ethers.providers.JsonRpcProvider) {
  return function (opts, args, context, info) {
    return sendTransaction(contractCache, provider, nextTxId++, opts, args, context, info)
  }
}
