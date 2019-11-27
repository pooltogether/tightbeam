import gql from 'graphql-tag'

export const sendTransactionMutation = gql`
  mutation sendTransactionMutation(
    $name: String!,
    $abi: String!,
    $address: String,
    $method: String!,
    $args: Object!,
    $gasLimit: String,
    $scaleGasEstimate: String,
    $value: String,
    $minimumGas: String
  ) {
    sendTransaction(
      name: $name,
      abi: $abi,
      address: $address,
      method: $method,
      args: $args,
      gasLimit: $gasLimit,
      value: $value,
      scaleGasEstimate: $scaleGasEstimate,
      minimumGas: $minimumGas
    ) @client
  }
`
