import * as mutations from './mutations'
import * as queries from './queries'
import { Tightbeam } from '../tightbeam'

/**
 * 
 * @param tightbeam The Tightbeam object
 */
export function bindResolvers(tightbeam: Tightbeam) {
  return {
    Query: {
      account: function () {
        return queries.accountResolver(tightbeam.providerSource) 
      },
      block: function (opts, args, context, info) {
        return queries.blockResolver(
          tightbeam.providerSource,
          opts,
          args,
          context,
          info
        ) 
      },
      call: function (opts, args, context, info) {
        return queries.callResolver(
          tightbeam.contractCache,
          tightbeam.providerSource,
          opts,
          args,
          context,
          info
        ) 
      },
      network: function () {
        return queries.networkResolver(tightbeam.providerSource) 
      },
      pastEvents: function (opts, args, context, info) {
        return queries.pastEventsResolver(
          tightbeam.contractCache,
          tightbeam.providerSource,
          tightbeam,
          opts,
          args,
          context,
          info
        )
      }
    },
    Mutation: {
      sendTransaction: mutations.sendTransactionResolverFactory(tightbeam.contractCache, tightbeam.providerSource)
    }
  }
}