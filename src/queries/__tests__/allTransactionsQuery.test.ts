import fetch from 'node-fetch'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory';
import { allTransactionsQuery } from '../allTransactionsQuery'
import { Transaction, TransactionParams } from '../../types'

describe('allTransactionsQuery', () => {

  let client, cache, link

  beforeEach(() => {
    cache = new InMemoryCache()
    link = new HttpLink({
      uri: 'http://localhost:4000/',
      fetch
    });
    client = new ApolloClient({
      cache,
      link
    })
  })

  describe('write', () => {
    it('should record all of the data in a Transaction', async () => {
      let tx = new Transaction()
      tx = {
        ...tx,
        id: 1,
        fn: 'functionName',
        name: 'contractName',
        abi: 'abiName',
        address: '0x1234',
        completed: true,
        sent: false,
        hash: 'hasme',
        error: 'errrr',
        blockNumber: 453,
        params: new TransactionParams(['1', '2', '3']),
        value: '52'
      }

      cache.writeQuery({
        query: allTransactionsQuery,
        data: {
          transactions: [
            tx
          ]
        }
      })

      const result = await client.readQuery({
        query: allTransactionsQuery
      })

      expect(result.transactions.length).toEqual(1)
      expect(result.transactions[0]).toMatchObject(tx)
    })
  })
})