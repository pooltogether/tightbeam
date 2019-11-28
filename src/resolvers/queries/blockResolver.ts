import { ProviderSource } from "../../types/ProviderSource"
import { Block } from "./Block"

const debug = require('debug')('tightbeam:blockResolver')

/**
 * Resolvers execute the behaviour when an Apollo query with the same name is run.
 */
export async function blockResolver (providerSource: ProviderSource, opts, args, context, info): Promise<Block> {
  const {
    blockNumber
  } = args

  const provider = await providerSource()
  debug('blockNumber: ', blockNumber)
  const block = await provider.getBlock(blockNumber)
  const result = {
    __typename: 'Block',
    id: blockNumber,
    ...block
  }
  debug(`block(${blockNumber}): `, result)
  return result
}
