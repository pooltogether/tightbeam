import { Transaction } from '../../types/Transaction'
import { allTransactionsQuery } from '../../queries'

export async function transactionsResolver(opts, args, { cache }, info): Promise<Array<Transaction>> {
  let {
    name,
    address,
    fn
  } = args

  const query = allTransactionsQuery
  const { transactions } = cache.readQuery({ query })

  return transactions.filter(tx => {
    const matchName = !name || tx.name === name
    const matchAddress = !address || tx.address === address
    const matchFn = !fn || ((matchName || matchAddress) &&  tx.fn === fn)
    return matchName && matchAddress && matchFn
  })
}
