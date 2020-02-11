import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory';
import { sendTransactionMutation } from '../sendTransactionMutation'

describe('sendTransactionMutation', () => {

  let client, cache, httpLink, sendTransaction

  beforeEach(() => {
    cache = new InMemoryCache()
    httpLink = new HttpLink({
      uri: 'http://localhost:4000/',
      fetch: jest.fn()
    });
    sendTransaction = jest.fn()
    
    client = new ApolloClient({
      cache,
      link: httpLink,
      resolvers: {
        Mutation: {
          sendTransaction
        }
      }
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