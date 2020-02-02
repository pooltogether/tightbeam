import { cloneDeep } from 'lodash'
import { transactionFragment } from '../queries'
import { ethers } from 'ethers'

const debug = require('debug')('tightbeam:watchTransaction')

export async function watchTransaction(id: string, client, provider: ethers.providers.BaseProvider): Promise<void> {
  const readTxFragment = () => {
    return client.readFragment({ fragment: transactionFragment, id })
  }

  let transaction = readTxFragment()
  const { hash } = transaction

  try {
    await provider.waitForTransaction(hash)
    const receipt = await provider.getTransactionReceipt(hash)
    
    let tx = readTxFragment()
    tx = cloneDeep(tx)
    if (receipt.status === 0) {
      tx = { ...tx, completed: true, error: `Status is 0` }
      debug(`Ethereum tx had a 0 status. Tx hash: ${hash}`)
    } else {
      tx = { ...tx, completed: true, blockNumber: receipt.blockNumber }
    }

    client.writeFragment({
      id,
      fragment: transactionFragment,
      data: tx
    })
  } catch (error) {
    console.error(error)
    let tx = readTxFragment()
    tx = { ...tx, completed: true, error: `Failed getting receipt: ${error}` }
    client.writeFragment({
      id,
      fragment: transactionFragment,
      data: tx
    })
    debug(`Unable to get transaction receipt for tx with hash: ${hash} - `, error)
  }
}