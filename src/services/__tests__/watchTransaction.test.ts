import { watchTransaction } from '../watchTransaction'
import { Transaction } from '../../types/Transaction'
import { transactionFragment } from '../../queries'

describe('watchTransaction()', () => { 
  let tx, receipt, client, provider

  beforeEach(() => {
    tx = new Transaction()
    tx.id = 1
    tx.hash = 'hellohash'

    client = {
      readFragment: jest.fn(() => tx),
      writeFragment: jest.fn()
    }

    receipt = { status: 1, blockNumber: 42 }

    provider = {
      waitForTransaction: jest.fn(() => Promise.resolve('ok!')),
      getTransactionReceipt: jest.fn(() => Promise.resolve(receipt))
    }
  })

  it('should update on successful tx', async () => {
    await watchTransaction('Transaction:1', client, provider)
    expect(client.writeFragment).toHaveBeenCalledWith({
      fragment: transactionFragment,
      id: 'Transaction:1',
      data: {
        ...tx,
        completed: true,
        blockNumber: 42
      }
    })
  })

  it('should update on failure', async () => {
    receipt = { status: 0 }
    await watchTransaction('Transaction:1', client, provider)
    expect(client.writeFragment).toHaveBeenCalledWith({
      fragment: transactionFragment,
      id: 'Transaction:1',
      data: {
        ...tx,
        completed: true,
        error: 'Status is 0'
      }
    })
  })

  it('should update on network failure', async () => {
    provider.waitForTransaction = jest.fn(() => Promise.reject('big problemo'))
    await watchTransaction('Transaction:1', client, provider)
    expect(client.writeFragment).toHaveBeenCalledWith({
      fragment: transactionFragment,
      id: 'Transaction:1',
      data: {
        ...tx,
        completed: true,
        error: 'Failed getting receipt: big problemo'
      }
    })
  })
})
