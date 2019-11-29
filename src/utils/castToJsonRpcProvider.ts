import { ethers } from 'ethers'

export function castToJsonRpcProvider(provider: ethers.providers.BaseProvider): ethers.providers.JsonRpcProvider {
  if (!(provider instanceof ethers.providers.JsonRpcProvider)) {
    throw new Error('requires JsonRpcProvider')
  }
  return provider
}