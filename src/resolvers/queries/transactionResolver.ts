import { transactionFragment } from '../../queries'
import { Transaction } from '../../types/Transaction'

export async function transactionResolver(opts, args, { cache, getCacheKey }, info): Promise<Transaction> {
  console.log('transactionResolver BEFORE', args)

  let {
    id
  } = args

  if (!id) { return null }
  
  let cacheKey = getCacheKey({ __typename: 'Transaction', id: id.toString() })

  const result = await cache.readFragment({
    id: cacheKey,
    fragment: transactionFragment
  })

  console.log('transactionResolver', { id, cacheKey: cacheKey.toString(), result })

  return result
}
