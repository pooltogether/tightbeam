import { BaseProvider, JsonRpcProvider } from 'ethers/providers'

export function castToJsonRpcProvider(provider: BaseProvider): JsonRpcProvider {
  if (!(provider instanceof JsonRpcProvider)) {
    throw new Error('requires JsonRpcProvider')
  }
  return provider
}