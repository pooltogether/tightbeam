import fetch from 'node-fetch'
import { ApolloClient } from 'apollo-client'
import { withClientState } from 'apollo-link-state'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory';
import { sendTransactionMutation } from '../sendTransactionMutation'
import { Transaction, TransactionParams } from '../../types'

describe('sendTransactionMutation', () => {

  let client, cache, httpLink, sendTransaction

  beforeEach(() => {
    cache = new InMemoryCache()
    httpLink = new HttpLink({
      uri: 'http://localhost:4000/',
      fetch
    });
    sendTransaction = jest.fn()
    const stateLink = withClientState({
      cache,
      resolvers: {
        Mutation: {
          sendTransaction
        }
      }
    })
    
    client = new ApolloClient({
      cache,
      link: ApolloLink.from([stateLink, httpLink])
    })
    
  })

  describe('write', () => {
    it('should record all of the data in a Transaction', async () => {
      const variables = {
        abi: 'abi',
        name: 'name',
        address: 'address',
        fn: 'fn',
        params: ['hello'],
        gasLimit: 32,
        value: 1,
        scaleGasEstimate: 1.1,
        minimumGas: 100000
      }

      await client.mutate({
        mutation: sendTransactionMutation,
        variables
      })

      expect(sendTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(variables),
        expect.anything(),
        expect.anything()
      )
    })
  })
})