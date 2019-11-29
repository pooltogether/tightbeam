import gql from 'graphql-tag'

export const networkQuery = gql`
  query networkQuery {
    network @client
  }
`