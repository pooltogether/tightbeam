import { allTransactionsQuery, transactionFragment } from '../../../queries'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ethers } from 'ethers'
import { bigNumberify } from 'ethers/utils'

const { sendTransactionResolver } = require('../sendTransactionResolver')

jest.mock('../../../services/watchTransaction')

const { watchTransaction } = require('../../../services/watchTransaction')

describe('sendTransactionResolver', () => {
  let cache

  let contractCache, contract, provider, providerSource, signer

  let sendUncheckedTransactionPromise

  beforeEach(() => {
    /**
     * 
     * Need to mock:
     * 
     * - contractCache.resolveContract()
     * - provider.getSigner()
     * - contract
     * - signer.sendUncheckedTransaction
     * 
     */
    
    cache = new InMemoryCache()

    // initialize cache
    cache.writeQuery({
      query: allTransactionsQuery,
      data: {
        transactions: []
      }
    })

    contractCache = {
      resolveContract: jest.fn(() => contract)
    }

    contract = {
      connect: jest.fn(() => contract),
      address: '0x1234',
      callMe: jest.fn(),
      interface: {
        functions: {
          callMe: {
            encode: jest.fn(() => 'encoded')
          }
        }
      },
      estimate: {
        callMe: jest.fn(async () => ethers.utils.bigNumberify(222222))
      }
    }

    sendUncheckedTransactionPromise = Promise.resolve('txhash')

    signer = {
      sendUncheckedTransaction: jest.fn(() => sendUncheckedTransactionPromise)
    }

    provider = {
      getSigner: jest.fn(() => signer)
    }

    providerSource = () => Promise.resolve(provider)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should complain when the fn does not exist', async () => {
    await expect(sendTransactionResolver(contractCache, providerSource, 1, {}, { name: 'Dai', fn: 'badFn', params: [1, "hello"]}, { cache }, {})).rejects.toEqual(new Error('Unknown function badFn for {"name":"Dai","address":"0x1234"}'))
  })

  it('should call a function when no value passed', async () => {
    const transaction = await sendTransactionResolver(contractCache, providerSource, 1, {}, { name: 'Dai', fn: 'callMe', params: [1, "hello"]}, { cache }, {})

    expect(transaction).toMatchObject({
      __typename: 'Transaction',
      id: 1,
      fn: 'callMe',
      name: 'Dai',
      abi: null,
      address: '0x1234',
      completed: false,
      sent: true,
      hash: 'txhash',
      error: null,
      blockNumber: null,
      params: {
        values: ['1', 'hello'],
        __typename: 'JSON'
      },
      value: '0'
    })
    
    expect(signer.sendUncheckedTransaction).toHaveBeenCalledWith(expect.objectContaining({
      data: 'encoded',
      to: '0x1234',
      gasLimit: bigNumberify('222222'),
      value: bigNumberify('0')
    }))

    const cached = cache.readFragment({ fragment: transactionFragment, id: `Transaction:1` })

    expect(cached).toMatchObject(transaction)

    expect(watchTransaction).toHaveBeenCalledWith('Transaction:1', cache, provider)
  })

  it('should accept value param', async () => {
    const transaction = await sendTransactionResolver(contractCache, providerSource, 1, {}, { name: 'Dai', fn: 'callMe', params: [1, "hello"], value: bigNumberify('12')}, { cache }, {})
    expect(transaction.value).toEqual('12')
    
    expect(signer.sendUncheckedTransaction).toHaveBeenCalledWith(expect.objectContaining({
      value: bigNumberify('12')
    }))

    const cached = cache.readFragment({ fragment: transactionFragment, id: `Transaction:1` })

    expect(cached.value).toEqual('12')
  })

  it('should accept an abi', async () => {
    const transaction = await sendTransactionResolver(contractCache, providerSource, 1, {}, { abi: 'ERC20', address: '0xabcd', fn: 'callMe', params: [1, "hello"], value: bigNumberify('12')}, { cache }, {})
    expect(transaction.abi).toEqual('ERC20')
    expect(transaction.name).toEqual(null)
  })

  it('should setup the tx as failed when an error occurs', async () => {
    sendUncheckedTransactionPromise = Promise.reject('FAILED')

    const transaction = await sendTransactionResolver(contractCache, providerSource, 1, {}, { name: 'Dai', fn: 'callMe', params: [1, "hello"], value: bigNumberify('12')}, { cache }, {})

    expect(transaction.hash).toEqual(null)
    expect(transaction.error).toEqual('FAILED')
    expect(transaction.completed).toEqual(true)
    expect(transaction.sent).toEqual(true)

    expect(cache.readFragment({ fragment: transactionFragment, id: `Transaction:1` })).toMatchObject(transaction)
    expect(watchTransaction).not.toHaveBeenCalled()

    // Now try with Error
    sendUncheckedTransactionPromise = Promise.reject(new Error('failmessage'))
    const transaction2 = await sendTransactionResolver(contractCache, providerSource, 1, {}, { name: 'Dai', fn: 'callMe', params: [1, "hello"], value: bigNumberify('12')}, { cache }, {})
    expect(transaction2.error).toEqual('failmessage')
  })
})