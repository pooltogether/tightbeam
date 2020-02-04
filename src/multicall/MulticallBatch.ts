import { ProviderSource } from '../types'
import { TransactionRequest } from 'ethers/providers'
import { Arrayish } from 'ethers/utils'
import { ethers } from 'ethers'

class Call {
  constructor(
    public readonly to: string,
    public readonly data: Arrayish,
    public readonly resolve: Function,
    public readonly reject: Function) {}
}

export class MulticallBatch {
  private calls: Array<Call> = []
  private callCount: number = 0

  constructor(
    private readonly providerSource: ProviderSource
  ) {}

  reset(callCount: number) {
    this.callCount = callCount
    this.calls.length = 0
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
    this.calls.push(new Call(
      to,
      data,
      resolveCb,
      rejectCb
    ))

    if (this.calls.length === this.callCount) {
      try {
        await this.execute()
      } catch (e) {
        console.error(e)
        await this.reject(e.message)
      }
    }

    return promise
  }

  async execute() {
    const data = ethers.utils.defaultAbiCoder.encode(
      [
        {
          components: [{ type: 'address' }, { type: 'bytes' }],
          name: 'data',
          type: 'tuple[]'
        }
      ],
      this.calls.map(call => [
        call.to,
        ethers.utils.hexlify(call.data)
      ])
    );

    const address = await this.multicallAddress()
    const provider = await this.providerSource()
    const tx = {
      address,
      data
    }
    const returnData = await provider.call(tx)

    const outerResultsDecoded = ethers.utils.defaultAbiCoder.decode(
      ['uint256', 'bytes[]'],
      returnData
    );

    const returnValues = outerResultsDecoded[1]

    for (let i = 0; i < returnValues; i++) {
      this.calls[i].resolve(returnValues[i])
    }
  }

  async reject(message) {
    this.calls.forEach(call => call.reject(message))
  }

  async multicallAddress() {
    const provider = await this.providerSource()
    const network = await provider.getNetwork()
    switch (network.chainId) {
      case 1:
        return "0xeefba1e63905ef1d7acba5a8513c70307c1ce441"
      case 42:
        return "0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a"
      case 4:
        return "0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821"
      case 5:
        return "0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e"
      default:
        console.warn(`multicall is not available on the network ${network.chainId}`)
        return null
    }
  }
}