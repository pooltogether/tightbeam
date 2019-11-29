import { ProviderSource } from '../../types/ProviderSource'
import { JsonRpcProvider } from 'ethers/providers'
import { castToJsonRpcProvider } from '../../utils/castToJsonRpcProvider'

const debug = require('debug')('pt:web3Resolvers')

/**
 * Resolvers execute the behaviour when an Apollo query with the same name is run.
 */
export async function accountResolver (providerSource: ProviderSource): Promise<string> {
  const provider = castToJsonRpcProvider(await providerSource())

  const signer = provider.getSigner()
  debug('signer: ', signer)
  const address = await signer.getAddress()
  debug('got address: ', address)
  return address
}