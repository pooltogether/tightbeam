import { Observable } from 'zen-observable-ts'
import { ProviderSource } from "../types";

export async function blockSubscriber(providerSource: ProviderSource): Promise<Observable<number>> {
  // const provider = await providerSource()

  // return new Observable<number>(observer => {
  //   const cb = (blockNumber) => {
  //     observer.next(blockNumber)
  //   }
  //   provider.on('block', cb)
  //   return () => provider.removeListener('block', cb)
  // })
  return null
}