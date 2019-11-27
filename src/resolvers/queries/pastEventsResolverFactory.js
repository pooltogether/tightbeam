import { GraphQLError } from "graphql"

const debug = require('debug')('pt:pastEventsResolverFactory')

export function pastEventsResolverFactory(ethersResolver) {
  return async function pastEventsResolver(opts, args, context, info) {
    const {
      abi,
      address,
      event,
      params,
      fromBlock,
      toBlock,
      topics,
      extraTopics
    } = args
    debug('pastEventsResolver: ', args)

    const contractName = abi
    const contractArgs = { address }

    const fieldName = event

    const paramMapHack = params ? params.reduce((map, param, index) => {
      map[index] = param
      return map
    }, {}) : {}

    const fieldArgs = paramMapHack

    const fieldDirectives = {
      pastEvents: {
        fromBlock,
        toBlock,
        topics,
        extraTopics
      }
    }

    try {
      return await ethersResolver.resolve(contractName, contractArgs, fieldName, fieldArgs, fieldDirectives)
    } catch (e) {
      const msg = `pastEventsResolver(${contractName}, ${address}, ${fieldName}, ${JSON.stringify(fieldArgs)}, ${JSON.stringify(fieldDirectives)}): ${e.message}`
      throw new GraphQLError(msg)
    }
  }
}