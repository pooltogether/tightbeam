import { transactionFragment } from '../../../queries'
import { ethers } from 'ethers'

const { sendTransactionResolver } = require('../sendTransactionResolver')

jest.mock('../../../utils/castToJsonRpcProvider')
jest.mock('../../../services/watchTransaction')

let resolveSendUncheckedTransaction
let rejectSendUncheckedTransaction
let sendUncheckedTransactionPromise
function sendUncheckedTransactionFactory() {
  return {
    sendUncheckedTransaction: () => sendUncheckedTransactionPromise
  }
}

jest.mock('../../../services/sendUncheckedTransaction', sendUncheckedTransactionFactory)

const { watchTransaction } = require('../../../services/watchTransaction')

const debug = require('debug')('tightbeam:sendTransactionResolver.test')

describe('sendTransactionResolver', () => {
  let client

  let contractCache, contract, provider, providerSource, signer

  beforeEach(() => {
    sendUncheckedTransactionPromise = new Promise((resolve, reject) => {
      resolveSendUncheckedTransaction = resolve
      rejectSendUncheckedTransaction = reject
    })
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

    client = {
      readQuery: jest.fn(() => ({ _transactions: ['tx1'] })),
      writeData: jest.fn((data) => { debug('WRROOOOTE ', data)}),
      writeFragment: jest.fn(function () { debug('writeFragment: ', arguments)}),
      readFragment: jest.fn()
    }

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

    

    signer = {}
    provider = {
      getSigner: jest.fn(() => signer)
    }

    providerSource = () => Promise.resolve(provider)
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
        params: [1, "hey there"]
      },
      { client },
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
        params: [1, "yo"]
      },
      { client },
      {}
    )

    const tx = {
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
        values: ['1', 'yo'],
        __typename: 'JSON'
      },
      value: null
    }

    expect(transaction).toMatchObject(tx)

    expect(client.writeData).toHaveBeenCalledWith({
      data: {
        _transactions: [
          'tx1',
          tx
        ]
      }
    })

    await resolveSendUncheckedTransaction('hash')

    expect(client.writeFragment).toHaveBeenCalledWith({
      id: 'Transaction:1',
      fragment: transactionFragment,
      data: {
        ...tx,
        hash: 'hash',
        sent: true
      }
    })
  })

  it('should accept value param', async () => {
    const transaction = await sendTransactionResolver(contractCache,
      providerSource,
      1,
      {},
      {
        name: 'Dai', fn: 'callMe', params: [1, "hello"], value: ethers.utils.bigNumberify('12')
      },
      { client },
      {}
    )
    expect(transaction.value).toEqual('12')

    await resolveSendUncheckedTransaction('hash')

    expect(client.writeFragment).toHaveBeenCalledWith({
      id: 'Transaction:1',
      fragment: transactionFragment,
      data: {
        ...transaction,
        hash: 'hash',
        sent: true
      }
    })
  })

  it('should accept null params', async () => {
    const transaction = await sendTransactionResolver(
      contractCache,
      providerSource,
      1,
      {},
      {
        name: 'Dai',
        fn: 'callMe',
        params: null
      },
      { client },
      {}
    )
    expect(transaction.params).toEqual({ "__typename": "JSON", "values": [] })
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
        params: [1, "what's up"],
        value: ethers.utils.bigNumberify('12')
      },
      { client },
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
        params: [1, "g'day"],
        value: '12'
      },
      { client },
      {}
    )

    const tx = {
      __typename: 'Transaction',
      id: 1,
      fn: 'callMe',
      name: 'Dai',
      abi: null,
      address: '0x1234',
      completed: false,
      sent: false,
      hash: null,
      gasPrice: null,
      gasLimit: null,
      scaleGasEstimate: null,
      minimumGas: null,
      error: null,
      blockNumber: null,
      params: {
        values: ['1', "g'day"],
        __typename: 'JSON'
      },
      value: '12'
    }

    expect(transaction).toMatchObject(tx)

    try {
      await rejectSendUncheckedTransaction(new Error('failmessage'))
      await sendUncheckedTransactionPromise
    } catch (e) {
      expect(e.message).toEqual('failmessage')
    }

    expect(client.writeFragment).toHaveBeenCalledWith({
      id: `Transaction:1`, 
      fragment: transactionFragment,
      data: {
        ...tx,
        completed: true,
        sent: true,
        error: 'failmessage'
      }
    })
    expect(watchTransaction).not.toHaveBeenCalled()
  })
})