import gql from 'graphql-tag'

export const blockQuery = gql`
  query blockQuery($blockNumber: Float!) {
    block(blockNumber: $blockNumber) @client
  }
`