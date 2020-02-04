import { MulticallBatch } from '../MulticallBatch'
const allSettled = require('promise.allsettled');

const { encodeCalls } = require('../encodeCalls')
const { decodeCalls } = require('../decodeCalls')

jest.mock('../encodeCalls')
jest.mock('../decodeCalls')

let decodeCallsResult
function decodeCallsFactory() {
  return {
    decodeCalls: () => decodeCallsResult
  }
}

jest.mock('../decodeCalls', decodeCallsFactory)

describe('MulticallBatch', () => {

  let batch

  let executor, execute

  beforeEach(async () => {
    execute = jest.fn(() => 'results')
    executor = {
      execute,
      networkSupportsMulticall: () => true
    }
    batch = new MulticallBatch(executor)
  })

  it('should execute immediately if batch size is not set', async () => {
    decodeCallsResult = [1, ['0xabcd decoded']]

    let tx = {
      to: '0x1234',
      data: '0xabcd'
    }

    const result = await batch.call(tx)

    expect(result).toEqual('0xabcd decoded')

    expect(encodeCalls).toHaveBeenCalledWith([])
    expect(execute).toHaveBeenCalledWith('encoded')
  })

  it('should correctly batch if multiple calls are passed', async () => {
    batch.setBatchSize(3)

    decodeCallsResult = [
      1,
      [
        'tx1 decoded',
        'tx2 decoded',
        'tx3 decoded'
      ]
    ]

    let tx1 = {
      to: '0x1',
      data: 'tx1'
    }

    let tx2 = {
      to: '0x2',
      data: 'tx2'
    }

    let tx3 = {
      to: '0x3',
      data: 'tx3'
    }

    const promise1 = batch.call(tx1)
    const promise2 = batch.call(tx2)
    const promise3 = batch.call(tx3)

    const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])

    expect(result1).toEqual('tx1 decoded')
    expect(result2).toEqual('tx2 decoded')
    expect(result3).toEqual('tx3 decoded')

    expect(execute).toHaveBeenCalledTimes(1)
  })
})
