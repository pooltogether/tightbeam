import { Observable } from 'zen-observable-ts'
import { ContractCache } from '../ContractCache'
import { EventFilter } from '../types/EventFilter'
import { buildFilter } from '../services/buildFilter'
import { LogEvent } from '../types/LogEvent'
import { Log } from 'ethers/providers'

const debug = require('debug')('tightbeam:eventSubscriber')

export async function eventSubscriber(
  contractCache: ContractCache,
  logsObserver: Observable<Array<Log>>,
  eventFilter: EventFilter
): Promise<Observable<LogEvent>> {
  

  const contract = await contractCache.resolveContract({
    abi: eventFilter.abi,
    address: eventFilter.address,
    name: eventFilter.name,
    contract: eventFilter.contract
  })

  const filter = buildFilter(
    contract.address,
    contract.interface,
    eventFilter
  )

  debug(eventFilter, filter)

  return new Observable<LogEvent>(observer => {
    const unsubscribe = logsObserver.subscribe((logs) => {
      for (let i = 0; i < logs.length; i++) {
        const log = logs[i]
        
        const addressMatch = !filter.address || filter.address.toLowerCase() === log.address.toLowerCase()

        if (!addressMatch) {
          continue
        }

        const topicsMatch = filter.topics.reduce((isMatch, filterTopic, currentIndex) => {
          return isMatch && (
            filterTopic === null ||
            filterTopic === undefined ||
            filterTopic === log.topics[currentIndex]
          )
        }, true)

        if (!topicsMatch) {
          continue
        }

        const event = {
          log,
          event: contract.interface.parseLog(log)
        }
        debug(`filter received `, filter, event)
        observer.next(event)
      }
    })
    
    return unsubscribe
  })
}