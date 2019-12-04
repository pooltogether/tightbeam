import { allTransactionsQuery } from '../../queries'
import { ContractCache } from '../../ContractCache'

import { sendUncheckedTransaction } from '../../services'
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
  contract = contract.connect(signer)
  address = contract.address

  const identifier = JSON.stringify({ abi, name, address })

  if (!contract[fn]) {
    throw new Error(`Unknown function ${fn} for ${identifier}`)
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

  const query = allTransactionsQuery
  const data = cache.readQuery({ query })

  cache.writeQuery({
    query,
    data: {
      transactions: data.transactions.concat([newTx])
    } 
  })



  const id = `Transaction:${newTx.id}`
  const readTx = (): Transaction => {
    return cache.readFragment({ fragment: transactionFragment, id })
  }

  sendUncheckedTransaction(contractCache, providerSource, newTx)
    .then(hash => {
      const transaction = readTx()
      transaction.hash = hash
      transaction.sent = true
      cache.writeData({ id, data: transaction })

      watchTransaction(id, cache, provider)

      return transaction
    })
    .catch(error => {
      console.error(error)
      debug(`Error occured while sending transaction`, error)
      const transaction = readTx()
      transaction.sent = true
      transaction.completed = true
      transaction.error = error.message ? error.message : error
      cache.writeData({ id, data: transaction })

      return transaction
    })

  return newTx
}
