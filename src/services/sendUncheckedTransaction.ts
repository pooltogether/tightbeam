import { ethers } from 'ethers'

import { ContractCache } from '../ContractCache'
import { Transaction } from '../types/Transaction'
import { ProviderSource } from '../types/ProviderSource'
import { gasCalculator } from '../utils'
import { castToJsonRpcProvider } from '../utils/castToJsonRpcProvider'

const debug = require('debug')('tightbeam:sendUncheckedTransaction')

export async function sendUncheckedTransaction(
  contractCache: ContractCache, 
  providerSource: ProviderSource, 
  tx: Transaction
): Promise<any> {
  let {
    abi,
    address,
    name,
    fn,
    params,
    gasLimit,
    gasPrice,
    scaleGasEstimate,
    minimumGas,
    value
  } = tx
  
  const provider = castToJsonRpcProvider(await providerSource())

  const signer = provider.getSigner()

  let contract = await contractCache.resolveContract({ abi, address, name })
  contract = contract.connect(signer)
  address = contract.address

  // let estimatedGasLimit = await contract.estimate[tx.fn](...params.values)
  let estimatedGasLimit = minimumGas
  let selectedGasLimit = gasCalculator(gasLimit, estimatedGasLimit, scaleGasEstimate, minimumGas)

  const transactionData = contract.interface.functions[fn].encode(params.values)

  const unsignedTransaction = {
    data: transactionData,
    to: contract.address,
    gasLimit: selectedGasLimit
  }

  if (value) {
    // @ts-ignore
    unsignedTransaction.value = ethers.utils.bigNumberify(value)
  }

  if (gasPrice) {
    // @ts-ignore
    unsignedTransaction.gasPrice = ethers.utils.bigNumberify(gasPrice)
  }

  debug(
    `ID: ${tx.id}\n
ContractAddress: ${address}\n
ContractMethod: ${fn}\n
TransactionParams: `, JSON.stringify(params), `\n\n
with gasLimit ${selectedGasLimit.toString()}\n\n
unsignedTransaction: `, JSON.stringify(unsignedTransaction))


  return await signer.sendUncheckedTransaction(unsignedTransaction)
}