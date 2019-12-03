export class TransactionParams {
  public __typename = 'JSON'

  constructor (
    public values: Array<string>
  ) {}
}

export class Transaction {
  public __typename = 'Transaction'
  public id: number
  public fn: any = null
  public name: string = null
  public abi: string = null
  public address: string = null
  public completed: boolean = false
  public sent: boolean = false
  public hash: string = null
  public error: string = null
  public gasLimit: string = null
  public gasPrice: string = null
  public scaleGasEstimate: string = null
  public minimumGas: string = null
  public blockNumber: number = null
  public params: TransactionParams = new TransactionParams([])
  public value: string = null
}