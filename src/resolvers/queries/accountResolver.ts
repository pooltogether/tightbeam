import { ProviderSource } from '../../types/ProviderSource'

const debug = require('debug')('pt:web3Resolvers')

/**
 * Resolvers execute the behaviour when an Apollo query with the same name is run.
 */
export const account = async function (providerSource: ProviderSource, opts, args, context, info): Promise<string> {
  const provider = await providerSource()
  try {
    const signer = provider.getSigner()
    debug('signer: ', signer)
    const address = await signer.getAddress()
    debug('got address: ', address)
    return address
  } catch (err) {
    debug('ERROR: ', err)
    if (err.message.indexOf('unknown account') === -1) {
      console.error(`Error in web3Resolvers#account: ${err}`)
    }
    return null
  }
}