import { Contract } from 'ethers/contract'
import { EventTopics } from '../types/EventTopics'
import { encodeEventTopics } from '../utils/encodeEventTopics'
import { TightbeamConfig } from '../TightbeamConfig'
import { Filter } from 'ethers/providers'

const debug = require('debug')('tightbeam:buildFilter')

export function buildFilter(
  config: TightbeamConfig,
  contract: Contract,
  eventName: string,
  params: Array<any>,
  topics: EventTopics,
  extraTopics: EventTopics,
  fromBlock: string | number,
  toBlock: string | number
): Filter {
  params = params || []

  let actualTopics = []
  if (topics) {
    actualTopics = encodeEventTopics(topics)
  } else if (eventName !== 'allEvents') {
    let fxnFilter = contract.filters[eventName]
    if (!fxnFilter) { throw new Error(`No event called ${eventName}`)}
    actualTopics = fxnFilter(...params).topics
    debug(`using topics for ${eventName}`, topics)
  }

  let encodedExtraTopics = []
  if (extraTopics) {
    encodedExtraTopics = encodeEventTopics(extraTopics)
  }

  const filter = {
    address: contract.address,
    fromBlock: fromBlock || config.defaultFromBlock,
    toBlock: toBlock || 'latest',
    topics: actualTopics.concat(encodedExtraTopics)
  }

  return filter
}