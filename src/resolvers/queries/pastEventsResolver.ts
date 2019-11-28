import { ContractCache } from "../../ContractCache"
import { TightbeamConfig } from "../../TightbeamConfig"
import { buildFilter } from '../../services/buildFilter'
import { ProviderSource } from "../../types/ProviderSource"
import { EventFilter } from "../../types/EventFilter"
import { LogEvent } from "../../types/LogEvent"

const debug = require('debug')('pt:pastEventsResolver')

export async function pastEventsResolver(
  contractCache: ContractCache,
  providerSource: ProviderSource,
  config: TightbeamConfig,
  opts, eventFilter: EventFilter, context?, info?
): Promise<Array<LogEvent>> {
  
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
      fromBlock: eventFilter.fromBlock || config.defaultFromBlock
    }
  )

  const provider = await providerSource()
  const logs = await provider.getLogs(filter)

  return logs.map(log => ({
    log,
    event: contract.interface.parseLog(log)
  }))
}