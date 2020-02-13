import { ContractCache } from '../../ContractCache'
import { ProviderSource } from '../../types/ProviderSource'

const debug = require('debug')('tightbeam:callResolver')

export async function callResolver(contractCache: ContractCache, providerSource: ProviderSource, opts, args, context, info) {
  // name and contract are the same- prefer 'contract', but 'name' is kept for backwards compatibility
  let {
    name,
    contract,
    abi,
    address,
    fn,
    params
  } = args

  params = params || []

  const ethersContract = await contractCache.resolveContract({ abi, address, name, contract })
  const identifier = JSON.stringify({ abi, address, contract: name || contract })

  const provider = await providerSource()

  const fnCall = ethersContract.interface.functions[fn]
  if (!fnCall) {
    throw new Error(`Unknown function ${fn} for ${identifier}`)
  } else {
    try {
      const data = fnCall.encode(params)

      const tx = {
        data,
        to: ethersContract.address
      }

      debug({ identifier, fn, params })

      let value
      if (context.multicallBatch && (await context.multicallBatch.isSupported())) {
        const to = await tx.to
        const data = await tx.data
        value = await context.multicallBatch.call(to, data)
      } else {
        value = await provider.call(tx)
      }

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
