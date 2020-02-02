import { Transaction } from '../../types/Transaction'
import { cachedTransactionsQuery } from '../../queries'

const debug = require('debug')('tightbeam:transactionsResolver')

export async function transactionsResolver(opts, args, { cache }, info): Promise<Array<Transaction>> {
  let {
    id,
    name,
    address,
    fn
  } = args || {}

  debug('FIRING TXS RESOLVER! ', { id,
    name,
    address,
    fn })

  const query = cachedTransactionsQuery
  const { _transactions } = cache.readQuery({ query })

  const result = _transactions.filter(tx => {
    const matchId = !id || tx.id === id
    const matchName = !name || tx.name === name
    const matchAddress = !address || tx.address === address
    const matchFn = !fn || ((matchName || matchAddress) &&  tx.fn === fn)
    return matchId && matchName && matchAddress && matchFn
  })

  debug('found: ', _transactions, result)

  return result
}
