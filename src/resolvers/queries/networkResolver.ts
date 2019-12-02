import { ProviderSource } from '../../types'

const debug = require('debug')('tightbeam:networkResolver')

/**
 * Resolvers execute the behaviour when an Apollo query with the same name is run.
 */
export const networkResolver = async function (providerSource: ProviderSource) {
  const provider = await providerSource()
  const network = await provider.getNetwork()
  const result = {
    __typename: 'Network',
    id: network.chainId,
    ...network
  }
  debug(result)
  return result
}