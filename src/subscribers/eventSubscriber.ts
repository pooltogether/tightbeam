import { Observable } from 'zen-observable-ts'
import { ContractCache } from '../ContractCache'
import { ProviderSource } from '../types/ProviderSource'
import { EventFilter } from '../types/EventFilter'
import { buildFilter } from '../services/buildFilter'
import { LogEvent } from '../types/LogEvent'

const debug = require('debug')('pt:subscriberFactory')

export async function eventSubscriber(
  contractCache: ContractCache,
  providerSource: ProviderSource,
  defaultFromBlock: number,
  eventFilter: EventFilter
): Promise<Observable<LogEvent>> {

  debug(eventFilter)

  const contract = await contractCache.resolveContract({
    abi: eventFilter.abi,
    address: eventFilter.address,
    contractName: eventFilter.name
  })

  const filter = buildFilter(
    contract.address,
    contract.interface,
    {
      ...eventFilter,
      fromBlock: eventFilter.fromBlock || defaultFromBlock
    }
  )

  const provider = await providerSource()

  return new Observable<LogEvent>(observer => {
    const cb = (log) => {
      const event = {
        log,
        event: contract.interface.parseLog(log)
      }
      debug(`filter received `, filter, event)
      observer.next(event)
    }
    provider.on(filter, cb)

    return () => provider.removeListener(filter, cb)
  })
}