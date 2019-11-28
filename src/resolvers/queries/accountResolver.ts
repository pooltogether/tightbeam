import { ProviderSource } from '../../types/ProviderSource'

const debug = require('debug')('pt:web3Resolvers')

/**
 * Resolvers execute the behaviour when an Apollo query with the same name is run.
 */
export async function accountResolver (providerSource: ProviderSource): Promise<string> {
  const provider = await providerSource()
  const signer = provider.getSigner()
  debug('signer: ', signer)
  const address = await signer.getAddress()
  debug('got address: ', address)
  return address
}