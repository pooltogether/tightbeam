import gql from 'graphql-tag'

export const contractQuery = gql`
  query contractQuery($name: String!) {
    contract(name: $name) @client
  }
`