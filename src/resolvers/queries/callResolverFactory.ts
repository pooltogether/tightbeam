import { ContractCache } from '../../ContractCache'

const debug = require('debug')('tightbeam:callResolverFactory')

export function callResolverFactory(contractCache: ContractCache) {
  return async function callResolver(opts, args, context, info) {
    let {
      name,
      abi,
      address,
      fn,
      params
    } = args

    params = params || []

    const contract = await contractCache.resolveContract({ abi, address, contractName: name })

    const identifier = JSON.stringify({ abi, name, address })

    const fnCall = contract.interface.functions[fn]
    if (!fnCall) {
      return Promise.reject(`Unknown function ${fn} for ${identifier}`)
    } else {
      try {
        const data = fnCall.encode(params)

        const tx = {
          data,
          to: contract.address
        }

        const provider = await this.actualProvider()

        debug({ identifier, fn, params })

        return provider.call(tx).then(function (value) {
          let returns = fnCall.decode(value)
          if (fnCall.outputs.length === 1) {
              returns = returns[0];
          }
          if (Array.isArray(returns)) {
            returns = Object.assign({}, returns)
          }
          return returns
        })
      } catch (error) {
        const msg = `${identifier} ${fn}(${JSON.stringify(params)}): ${error.message}`
        console.error(msg, error)
        throw error
      }
    }
  }
}
