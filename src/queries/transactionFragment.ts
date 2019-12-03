import gql from 'graphql-tag'

export const transactionFragment = gql`
  fragment transaction on Transaction {
    id
    params {
      values
    }
    name
    abi
    address
    blockNumber
    completed
    error
    hash
    fn
    sent
    gasLimit
    scaleGasEstimate
    minimumGas
    value
  }
`
