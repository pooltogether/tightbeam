import { allTransactionsQuery, transactionFragment } from '../../../queries'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ethers } from 'ethers'

const { sendTransactionResolver } = require('../sendTransactionResolver')

jest.mock('../../../utils/castToJsonRpcProvider')
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

    sendUncheckedTransactionPromise = Promise.resolve()

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
    await expect(sendTransactionResolver(
      contractCache,
      providerSource,
      1,
      {},
      {
        name: 'Dai',
        fn: 'badFn',
        params: [1, "hello"]
      },
      { cache },
      {}
    )).rejects.toEqual(new Error('Unknown function badFn for {"name":"Dai","address":"0x1234"}'))
  })

  it('should call a function when no value passed', async () => {
    const transaction = await sendTransactionResolver(
      contractCache,
      providerSource,
      1,
      {},
      {
        name: 'Dai',
        fn: 'callMe',
        gasPrice: ethers.utils.bigNumberify('12'),
        gasLimit: ethers.utils.bigNumberify('24'),
        scaleGasEstimate: ethers.utils.bigNumberify('36'),
        minimumGas: ethers.utils.bigNumberify('48'),
        params: [1, "hello"]
      },
      { cache },
      {}
    )

    expect(transaction).toMatchObject({
      __typename: 'Transaction',
      id: 1,
      fn: 'callMe',
      name: 'Dai',
      abi: null,
      address: '0x1234',
      completed: false,
      sent: false,
      hash: null,
      gasPrice: '12',
      gasLimit: '24',
      scaleGasEstimate: '36',
      minimumGas: '48',
      error: null,
      blockNumber: null,
      params: {
        values: ['1', 'hello'],
        __typename: 'JSON'
      },
      value: null
    })
    
    const cached = cache.readFragment({ fragment: transactionFragment, id: `Transaction:1` })

    expect(cached).toMatchObject(transaction)
  })

  it('should accept value param', async () => {
    const transaction = await sendTransactionResolver(contractCache,
      providerSource,
      1,
      {},
      {
        name: 'Dai', fn: 'callMe', params: [1, "hello"], value: ethers.utils.bigNumberify('12')
      },
      { cache },
      {}
    )
    expect(transaction.value).toEqual('12')
    
    const cached = cache.readFragment({ fragment: transactionFragment, id: `Transaction:1` })

    expect(cached.value).toEqual('12')
  })

  it('should accept an abi', async () => {
    const transaction = await sendTransactionResolver(contractCache,
      providerSource,
      1,
      {},
      {
        abi: 'ERC20',
        address: '0xabcd',
        fn: 'callMe',
        params: [1, "hello"],
        value: ethers.utils.bigNumberify('12')
      },
      { cache },
      {}
    )
    expect(transaction.abi).toEqual('ERC20')
    expect(transaction.name).toEqual(null)
  })

  it('should setup the tx as failed when an error occurs', async () => {
    const transaction = await sendTransactionResolver(contractCache,
      providerSource,
      1,
      {}, 
      {
        name: 'Dai',
        fn: 'callMe',
        params: [1, "hello"],
        value: ethers.utils.bigNumberify('12')
      },
      { cache },
      {}
    )

    expect(transaction.hash).toEqual(null)
    expect(transaction.error).toEqual(null)
    expect(transaction.completed).toEqual(false)
    expect(transaction.sent).toEqual(false)

    expect(cache.readFragment({ fragment: transactionFragment, id: `Transaction:1` })).toMatchObject(transaction)
    expect(watchTransaction).not.toHaveBeenCalled()



    // One more time, with error!
    sendUncheckedTransactionPromise = Promise.reject(new Error('failmessage'))
    await sendTransactionResolver(
      contractCache,
      providerSource,
      1,
      {},
      {
        name: 'Dai',
        fn: 'callMe',
        params: [1, "hello"],
        value: ethers.utils.bigNumberify('12')
      },
      { cache },
      {}
    )
  })
})