import { cachedTransactionsQuery } from '../../queries'
import { ContractCache } from '../../ContractCache'

import { sendUncheckedTransaction } from '../../services/sendUncheckedTransaction'
import { transactionFragment } from '../../queries'
import { Transaction, TransactionParams } from '../../types/Transaction'
import { ProviderSource } from '../../types/ProviderSource'
import { castToJsonRpcProvider } from '../../utils/castToJsonRpcProvider'
import { watchTransaction } from '../../services/watchTransaction'

const debug = require('debug')('tightbeam:sendTransaction')

export async function sendTransactionResolver(contractCache: ContractCache, providerSource: ProviderSource, txId: number, opts, args, context, info): Promise<Transaction> {
  const { cache } = context
  let {
    abi,
    name,
    address,
    fn,
    params,
    gasLimit,
    gasPrice,
    value,
    scaleGasEstimate,
    minimumGas
  } = args
  
  const provider = castToJsonRpcProvider(await providerSource())

  const signer = provider.getSigner()

  let contract = await contractCache.resolveContract({ abi, address, name })
  contract.connect(signer),
  address = contract.address

  const identifier = JSON.stringify({ abi, name, address })

  if (!contract[fn]) {
    throw new Error(`Unknown function ${fn} for ${identifier}`)
  }

  if (!params) {
    params = []
  }

  let newTx = new Transaction()
  
  newTx = {
    ...newTx,
    id: txId,
    fn,
    name: name || null,
    abi: abi || null,
    address,
    completed: false,
    sent: false,
    hash: null,
    error: null,
    blockNumber: null,
    gasLimit: gasLimit ? gasLimit.toString() : null,
    gasPrice: gasPrice ? gasPrice.toString() : null,
    scaleGasEstimate: scaleGasEstimate ? scaleGasEstimate.toString() : null,
    minimumGas: minimumGas ? minimumGas.toString() : null,
    value: value ? value.toString() : null,
    params: new TransactionParams(Array.from(params).map(param => param.toString())),
  }

  const query = cachedTransactionsQuery
  const data = cache.readQuery({ query })

  cache.writeData({
    // query,
    data: {
      _transactions: data._transactions.concat([newTx])
    } 
  })

  const id = `Transaction:${newTx.id}`

  sendUncheckedTransaction(contractCache, providerSource, newTx)
    .then(hash => {
      const data = {
        ...newTx,
        hash,
        sent: true
      }
      debug(`Tx sent!`)

      cache.writeFragment({
        id,
        fragment: transactionFragment,
        data
      })

      watchTransaction(id, cache, provider)

      return data
    })
    .catch(error => {
      console.error(error)
      debug(`Error occured while sending transaction`, error)

      const data = {
        ...newTx, 
        completed: true, 
        sent: true, 
        error: error.message
      }

      cache.writeFragment({
        id,
        fragment: transactionFragment,
        data
      })

      return data
    })

  return newTx
}
