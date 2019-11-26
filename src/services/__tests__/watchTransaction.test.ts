import { watchTransaction } from '../watchTransaction'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { Transaction } from '../../resolvers/mutation/sendTransaction'
import { allTransactionsQuery, transactionFragment } from '../../gql'

describe('watchTransaction()', () => { 
  let tx, receipt, cache, provider

  beforeEach(() => {
    cache = new InMemoryCache()

    tx = new Transaction()
    tx.id = 1
    tx.hash = 'hellohash'

    cache.writeQuery({
      query: allTransactionsQuery,
      data: {
        transactions: [
          tx
        ]
      }
    })

    receipt = { status: 1, blockNumber: 42 }

    provider = {
      waitForTransaction: jest.fn(() => Promise.resolve('ok!')),
      getTransactionReceipt: jest.fn(() => Promise.resolve(receipt))
    }
  })

  it('should update on successful tx', async () => {
    await watchTransaction('Transaction:1', cache, provider)
    const result = cache.readFragment({ fragment: transactionFragment, id: 'Transaction:1' })
    expect(result).toMatchObject({
      ...tx,
      completed: true,
      blockNumber: 42
    })
  })

  it('should update on failure', async () => {
    receipt = { status: 0 }
    await watchTransaction('Transaction:1', cache, provider)
    const result = cache.readFragment({ fragment: transactionFragment, id: 'Transaction:1' })
    expect(result).toMatchObject({
      ...tx,
      completed: true,
      error: 'Status is 0'
    })
  })

  it('should update on network failure', async () => {
    provider.waitForTransaction = jest.fn(() => Promise.reject('big problemo'))
    await watchTransaction('Transaction:1', cache, provider)
    const result = cache.readFragment({ fragment: transactionFragment, id: 'Transaction:1' })
    expect(result).toMatchObject({
      ...tx,
      completed: true,
      error: 'Failed getting receipt: big problemo'
    })
  })
})