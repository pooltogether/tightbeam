import { Observable } from 'zen-observable-ts'
import { ContractCache } from '../ContractCache'
import { ProviderSource } from '../types/ProviderSource'
import { TightbeamConfig } from '../TightbeamConfig'
import { EventFilter } from '../types/EventFilter'
import { buildFilter } from '../services/buildFilter'
import { LogEvent } from '../types/LogEvent'

const debug = require('debug')('pt:subscriberFactory')

export async function eventSubscriber(
  contractCache: ContractCache,
  providerSource: ProviderSource,
  config: TightbeamConfig,
  eventFilter: EventFilter
): Promise<Observable<LogEvent>> {

  debug(eventFilter)

  const contract = await contractCache.resolveContract({
    abi: eventFilter.abi,
    address: eventFilter.address,
    contractName: eventFilter.name
  })

  const filter = buildFilter(
    config,
    contract,
    eventFilter.event,
    eventFilter.params,
    eventFilter.topics,
    eventFilter.extraTopics,
    eventFilter.fromBlock,
    eventFilter.toBlock
  )

  const provider = await providerSource()

  return new Observable<LogEvent>(observer => {
    provider.on(filter, (log) => {
      const event = {
        log,
        event: contract.interface.parseLog(log)
      }
      debug(`filter received `, filter, event)
      observer.next(event)
    })
  })
}