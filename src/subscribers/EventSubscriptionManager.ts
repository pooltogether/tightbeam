import { Observable } from 'zen-observable-ts'
import { ProviderSource } from "../types";
import { Log } from 'ethers/providers';
import { BlockSubscriptionManager } from './BlockSubscriptionManager';

const debug = require('debug')('tightbeam:EventSubscriptionManager')

export class EventSubscriptionManager {
  public readonly observers: Array<any> = []
  private unsubscribe: any

  constructor (
    public readonly providerSource: ProviderSource,
    public readonly blockSubscriptionManager: BlockSubscriptionManager
  ) {
  }

  async start() {
    const provider = await this.providerSource()
    const observable = await this.blockSubscriptionManager.subscribe()
    this.unsubscribe = observable.subscribe(async (blockNumber) => {
      const logs = await provider.getLogs({
        fromBlock: blockNumber,
        toBlock: blockNumber
      })
      this.notify(logs)
    })
  }

  async stop() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  notify = async (logs: Log[]) => {
    this.observers.forEach(observer => {
      observer.next(logs)
    })
  }

  async subscribe(): Promise<Observable<Array<Log>>> {
    return new Observable<Array<Log>>(observer => {
      this.addObserver(observer)
      return () => { this.removeObserver(observer) }
    })
  }

  addObserver(observer) {
    this.observers.push(observer)
  }

  removeObserver(observer) {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }
}