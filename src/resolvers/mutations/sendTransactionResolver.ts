import { allTransactionsQuery, transactionFragment } from '../../queries'
import { gasCalculator } from '../../utils'
import { ContractCache } from '../../ContractCache'
import { ethers } from 'ethers'
import { watchTransaction } from '../../services'
import { Transaction, TransactionParams } from '../../types/Transaction'
import { ProviderSource } from '../../types/ProviderSource'
import { castToJsonRpcProvider } from '../../utils/castToJsonRpcProvider'

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
    value,
    scaleGasEstimate,
    minimumGas
  } = args
  
  const provider = castToJsonRpcProvider(await providerSource())

  const signer = provider.getSigner()

  let contract = await contractCache.resolveContract({abi, address, name })
  contract = contract.connect(signer)
  address = contract.address

  const identifier = JSON.stringify({ abi, name, address })

  if (!contract[fn]) {
    throw new Error(`Unknown function ${fn} for ${identifier}`)
  }

  if (value) {
    value = ethers.utils.bigNumberify(value)
  } else {
    value = ethers.utils.bigNumberify('0')
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
    params: new TransactionParams(Array.from(params).map(param => param.toString())),
    value: value.toString()
  }

  const query = allTransactionsQuery
  const data = cache.readQuery({ query })
  data.transactions.push(newTx)
  cache.writeQuery({ query, data })

  let estimatedGasLimit = await contract.estimate[fn](...params)

  let selectedGasLimit = gasCalculator(gasLimit, estimatedGasLimit, scaleGasEstimate, minimumGas)
  
  const transactionData = contract.interface.functions[fn].encode(params)

  const unsignedTransaction = {
    data: transactionData,
    to: contract.address,
    gasLimit: selectedGasLimit,
    value
  }

  debug(
`Identifier: ${identifier}\n
ContractAddress: ${address}\n
ContractMethod: ${fn}\n
ContractArgs: ${args}\n\n
with gasLimit ${selectedGasLimit.toString()}\n\n
unsignedTransaction: `, JSON.stringify(unsignedTransaction))

  const id = `Transaction:${txId}`
  const readTx = () => {
    return cache.readFragment({ fragment: transactionFragment, id })
  }

  return await signer.sendUncheckedTransaction(unsignedTransaction)
    .then(async function (hash) {
      let transaction = readTx()
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
}
