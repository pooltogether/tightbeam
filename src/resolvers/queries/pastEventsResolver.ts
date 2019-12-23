import { ethers } from 'ethers'

import { ContractCache } from "../../ContractCache"
import { buildFilter } from '../../services/buildFilter'
import { ProviderSource } from "../../types/ProviderSource"
import { EventFilter } from "../../types/EventFilter"
import { LogEvent } from "../../types/LogEvent"
import { Tightbeam } from "../../tightbeam"

const debug = require('debug')('tightbeam:pastEventsResolver')

export async function pastEventsResolver(
  contractCache: ContractCache,
  providerSource: ProviderSource,
  tightbeam: Tightbeam,
  opts, 
  eventFilter: EventFilter, 
  context?, 
  info?
): Promise<Array<LogEvent>> {
  
  debug(eventFilter)

  const contract = await contractCache.resolveContract({
    abi: eventFilter.abi,
    address: eventFilter.address,
    name: eventFilter.name
  })

  const filter = buildFilter(
    contract.address,
    contract.interface,
    {
      ...eventFilter,
      fromBlock: eventFilter.fromBlock || tightbeam.defaultFromBlock
    }
  )

  const provider = providerSource ?
    await providerSource() :
    await ethers.getDefaultProvider()
  // const provider = await providerSource()

  const logs = await provider.getLogs(filter)
  
  return logs.map(log => ({
    log,
    event: contract.interface.parseLog(log)
  }))
}