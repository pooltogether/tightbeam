import gql from 'graphql-tag'

export const sendTransactionMutation = gql`
  mutation sendTransactionMutation(
    $name: String!,
    $abi: String!,
    $address: String,
    $fn: String!,
    $params: Object!,
    $gasLimit: String,
    $gasPrice: String,
    $scaleGasEstimate: String,
    $value: String,
    $minimumGas: String
  ) {
    sendTransaction(
      name: $name,
      abi: $abi,
      address: $address,
      fn: $fn,
      params: $params,
      gasLimit: $gasLimit,
      gasPrice: $gasPrice,
      value: $value,
      scaleGasEstimate: $scaleGasEstimate,
      minimumGas: $minimumGas
    ) @client
  }
`
