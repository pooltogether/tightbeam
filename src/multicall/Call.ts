import { Arrayish } from 'ethers/utils'

export class Call {
  constructor(
    public readonly to: string,
    public readonly data: Arrayish,
    public readonly resolve: Function,
    public readonly reject: Function) {}
}
