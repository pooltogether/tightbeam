import { bindMutationResolvers } from './bindMutationResolvers'
import { bindQueryResolvers } from './bindQueryResolvers'
import { Tightbeam } from '../Tightbeam'

/**
 * 
 * @param tightbeam The Tightbeam object
 */
export function bindResolvers(tightbeam: Tightbeam) {
  return {
    Query: bindQueryResolvers(tightbeam.contractCache, tightbeam.providerSource, tightbeam.defaultFromBlock),
    Mutation: bindMutationResolvers(tightbeam.mutationContractCache, tightbeam.mutationProviderSource)
  }
}