import { ProviderSource } from '../../types/ProviderSource'
import { castToJsonRpcProvider } from '../../utils/castToJsonRpcProvider'

const debug = require('debug')('tightbeam:web3Resolvers')

/**
 * Resolvers execute the behaviour when an Apollo query with the same name is run.
 */
export async function accountResolver (providerSource: ProviderSource): Promise<string> {
  try {
    const provider = castToJsonRpcProvider(await providerSource())
    const accounts = await provider.listAccounts()
    if (!accounts.length) { return null }
    const signer = provider.getSigner()
    debug('signer: ', signer)
    const address = await signer.getAddress()
    debug('got address: ', address)
    return address
  } catch (e) {
    if(/JsonRpcProvider/.test(e.toString())) {
      return null
    }
    if (/unknown account #0/.test(e.toString())) {
      return null
    }
    throw e
  }  
}