import gql from 'graphql-tag'
import { transactionFragment } from './transactionFragment'

export const cachedTransactionsQuery = gql`
  query cachedTransactionsQuery {
    _transactions @client(always: true) {
      ...transaction
    }
  }
  ${transactionFragment}
`
