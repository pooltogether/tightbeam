import { ProviderSource } from '../../types'

/**
 * Resolvers execute the behaviour when an Apollo query with the same name is run.
 */
export const networkResolver = async function (providerSource: ProviderSource) {
  const provider = await providerSource()
  return await provider.getNetwork()
}