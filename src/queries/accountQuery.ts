import gql from 'graphql-tag'

export const accountQuery = gql`
  query accountQuery {
    account @client
  }
`