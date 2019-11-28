import { ContractCache } from '../../ContractCache'
import { ProviderSource } from '../../types/ProviderSource'

const debug = require('debug')('tightbeam:callResolver')

export async function callResolver(contractCache: ContractCache, providerSource: ProviderSource, opts, args, context, info) {
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

  const provider = await providerSource()

  const fnCall = contract.interface.functions[fn]
  if (!fnCall) {
    throw new Error(`Unknown function ${fn} for ${identifier}`)
  } else {
    try {
      const data = fnCall.encode(params)

      const tx = {
        data,
        to: contract.address
      }

      debug({ identifier, fn, params })

      const value = await provider.call(tx)
      let returns = fnCall.decode(value)
      if (fnCall.outputs.length === 1) {
          returns = returns[0];
      }
      if (Array.isArray(returns)) {
        returns = Object.assign({}, returns)
      }

      return returns
    } catch (error) {
      const msg = `${identifier} ${fn}(${JSON.stringify(params)}): ${error.message || error}`
      console.error(msg, error)
      throw msg
    }
  }
}