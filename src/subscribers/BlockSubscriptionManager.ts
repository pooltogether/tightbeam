import { Observable } from 'zen-observable-ts'
import { ProviderSource } from "../types";

const debug = require('debug')('tightbeam:BlockSubscriptionManager')

export class BlockSubscriptionManager {
  public readonly observers: Array<any> = []

  constructor (public readonly providerSource: ProviderSource) {
  }

  async start() {
    const provider = await this.providerSource()
    provider.on('block', this.notify)
  }

  async stop() {
    const provider = await this.providerSource()
    provider.removeListener('block', this.notify)
  }

  notify = async (blockNumber) => {
    debug(`notify(${blockNumber})`)
    this.observers.forEach(observer => {
      observer.next(blockNumber)
    })
  }

  async subscribe(): Promise<Observable<number>> {
    return new Observable<number>(observer => {
      this.addObserver(observer)
      return () => { this.removeObserver(observer) }
    })
  }

  addObserver(observer) {
    this.observers.push(observer)
  }

  removeObserver(observer) {
    const index = this.observers.findIndex(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }
}