import { encodeEventTopics } from '../utils/encodeEventTopics'
import { Filter } from 'ethers/providers'
import { Interface } from 'ethers/utils'
import { EventFilter } from '../types'

const debug = require('debug')('tightbeam:buildFilter')

export function buildFilter(address: string, ethersInterface: Interface, filterParams: EventFilter): Filter {
  const {
    params,
    topics,
    event,
    extraTopics,
    fromBlock,
    toBlock
  } = filterParams

  let actualTopics = []
  if (topics) {
    actualTopics = encodeEventTopics(topics)
  } else if (!event || event === 'allEvents') {
    actualTopics = [null]    
  } else {
    let eventInterface = ethersInterface.events[event]
    if (!eventInterface) { throw new Error(`No event called ${event}`)}
    actualTopics = eventInterface.encodeTopics(params || [])
    debug(`using topics for ${event}`, topics)
  }

  let encodedExtraTopics = []
  if (extraTopics) {
    encodedExtraTopics = encodeEventTopics(extraTopics)
  }

  const filter = {
    address,
    fromBlock: fromBlock || 0,
    toBlock: toBlock || 'latest',
    topics: actualTopics.concat(encodedExtraTopics)
  }

  return filter
}