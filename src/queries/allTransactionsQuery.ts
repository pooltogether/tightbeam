import gql from 'graphql-tag'
import { transactionFragment } from './transactionFragment'

/**
 * @param test Tests something!
 */
export const allTransactionsQuery = gql`
  query allTransactionsQuery {
    transactions @client {
      ...transaction
    }
  }
  ${transactionFragment}
`
