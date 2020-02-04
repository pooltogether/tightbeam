import { TransactionRequest } from 'ethers/providers'
import { Call } from './Call'
import { encodeCalls } from './encodeCalls'
import { decodeCalls } from './decodeCalls'
import { MulticallExecutor } from './MulticallExecutor'

export class MulticallBatch {
  private calls: Array<Call> = []
  private batchSize: number = 0

  constructor(
    private readonly executor: MulticallExecutor
  ) {}

  setBatchSize(batchSize: number) {
    this.batchSize = batchSize
  }

  async call(transaction: TransactionRequest) {
    let resolveCb: Function
    let rejectCb: Function
    const promise = new Promise((resolve, reject) => {
      resolveCb = resolve
      rejectCb = reject
    })
    const to = await transaction.to
    const data = await transaction.data
    const call = new Call(
      to,
      data,
      resolveCb,
      rejectCb
    )
    this.calls.push(call)

    if (await this.canExecute()) {
      try {
        await this.execute()
      } catch (e) {
        console.error(e)
        this.calls.map(async (call) => call.reject(e.message))
      }
    }

    return promise
  }

  async canExecute(): Promise<boolean> {
    const isMulticall = await this.executor.networkSupportsMulticall()
    return !isMulticall || this.calls.length >= this.batchSize
  }

  async execute() {
    const data = encodeCalls(this.calls)
    const returnData = await this.executor.execute(data)
    const [blockNumber, returnValues] = decodeCalls(returnData)

    for (let i = 0; i < returnValues.length; i++) {
      this.calls[i].resolve(returnValues[i])
    }
  }
}
