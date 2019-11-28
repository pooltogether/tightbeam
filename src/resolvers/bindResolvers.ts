import * as mutations from './mutations'
import * as queries from './queries'
import { ContractCache } from '../ContractCache'
import { ProviderSource } from '../types/ProviderSource'
import { TightbeamConfig } from '../TightbeamConfig'

export function bindResolvers(contractCache: ContractCache, providerSource: ProviderSource, tightbeamConfig: TightbeamConfig) {
  return {
    Query: {
      call: queries.callResolver.bind(null, contractCache),
      pastEvents: queries.pastEventsResolver.bind(null, contractCache, providerSource, tightbeamConfig)
    },
    Mutation: {
      sendTransaction: mutations.sendTransactionResolverFactory(contractCache, providerSource)
    }
  }
}