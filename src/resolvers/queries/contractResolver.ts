import { ContractCache } from '../../ContractCache'

const debug = require('debug')('tightbeam:contractResolver')

interface ContractType {
  __typename: string
  id: string
  name: string
  chainId: number
  address: string
}

export async function contractResolver(contractCache: ContractCache, opts, args, context, info): Promise<ContractType> {
  let {
    name,
    address,
    abi
  } = args

  const contract = await contractCache.resolveContract({ name, address, abi })

  if (!contract) {
    const error = `tightbeam: contractResolver(): unknown contract ${JSON.stringify({ name, address, abi })}`
    debug(error)
    throw new Error(error)
  }

  const { chainId } = await contract.provider.getNetwork()

  return {
    __typename: 'Contract',
    id: `${chainId}@${contract.address}`,
    address: contract.address,
    chainId,
    name
  }
}