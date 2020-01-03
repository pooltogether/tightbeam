import { ethers } from 'ethers'

export function castToJsonRpcProvider(provider: ethers.providers.BaseProvider): ethers.providers.JsonRpcProvider {
  if (!provider || !provider['getSigner']) {
    throw new Error('requires JsonRpcProvider')
  }
  // @ts-ignore
  return provider
}