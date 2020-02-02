import gql from 'graphql-tag'
import { transactionFragment } from './transactionFragment'

export const transactionsQuery = gql`
  query transactionsQuery($id: String) {
    transactions(id: $id) @client(always: true) {
      ...transaction
    }
  }
  ${transactionFragment}
`
