import { transactionFragment } from '../queries'
import { Transaction } from '../types'
import { BaseProvider } from 'ethers/providers'

const debug = require('debug')('tightbeam:watchTransaction')

export async function watchTransaction(id: string, cache, provider: BaseProvider): Promise<void> {
  const readTx = () => {
    return cache.readFragment({ fragment: transactionFragment, id })
  }

  let transaction = readTx()
  const { hash } = transaction

  let data: Transaction

  try {
    await provider.waitForTransaction(hash)
    const receipt = await provider.getTransactionReceipt(hash)
    
    if (receipt.status === 0) {
      data = { ...transaction, completed: true, error: `Status is 0` }
      debug(`Ethereum tx had a 0 status. Tx hash: ${hash}`)
    } else {
      data = { ...transaction, completed: true, blockNumber: receipt.blockNumber }
    }

    cache.writeData({ id, data })
  } catch (error) {
    data = { ...transaction, completed: true, error: `Failed getting receipt: ${error}` }
    cache.writeData({ id, data })
    debug(`Unable to get transaction receipt for tx with hash: ${hash} - `, error)
  }
}