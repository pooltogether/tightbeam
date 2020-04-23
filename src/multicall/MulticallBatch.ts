import { Call } from './Call'
import { encodeCalls } from './encodeCalls'
import { decodeCalls } from './decodeCalls'
import { MulticallExecutor } from './MulticallExecutor'
import { Arrayish } from 'ethers/utils'

let nextId = 0

const debug = require('debug')('tightbeam:MulticallBatch')

export class MulticallBatch {
  private calls: Array<Call> = []
  private batchSize: number = 0
  public readonly id: number = nextId++

  constructor(
    private readonly executor: MulticallExecutor
  ) {}

  setBatchSize(batchSize: number) {
    this.batchSize = batchSize
  }

  async call(to: string, data: Arrayish) {
    let resolveCb: Function
    let rejectCb: Function
    const promise = new Promise((resolve, reject) => {
      resolveCb = resolve
      rejectCb = reject
    })
    const call = new Call(
      to,
      data,
      resolveCb,
      rejectCb
    )
    this.calls.push(call)

    if (this.atBatchSize()) {
      try {
        await this.execute()
      } catch (e) {
        console.error(e)
        this.calls.map(async (call) => call.reject(e.message))
      }
    }

    return promise
  }

  atBatchSize() {
    return this.calls.length >= this.batchSize
  }

  async isSupported(): Promise<boolean> {
    return await this.executor.networkSupportsMulticall()
  }

  async execute() {
    const data = encodeCalls(this.calls)
    debug('execute', { batchId: this.id })
    
    let returnData = null

    try {
      returnData = await this.executor.execute(data)
    } catch (e) {
      console.warn(`executor.execute() failed`, e)
    }

    if (returnData) {
      const [blockNumber, returnValues] = decodeCalls(returnData)

      for (let i = 0; i < returnValues.length; i++) {
        this.calls[i].resolve(returnValues[i])
      }
    }
  }
}
