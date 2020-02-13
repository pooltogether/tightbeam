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
    contract,
    address,
    abi
  } = args

  const ethersContract = await contractCache.resolveContract({ name, address, abi, contract })

  if (!ethersContract) {
    const error = `tightbeam: contractResolver(): unknown contract ${JSON.stringify({ name, address, abi })}`
    debug(error)
    throw new Error(error)
  }

  const { chainId } = await ethersContract.provider.getNetwork()

  return {
    __typename: 'Contract',
    id: `${chainId}@${ethersContract.address}`,
    address: ethersContract.address,
    chainId,
    name
  }
}