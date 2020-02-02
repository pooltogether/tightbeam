import gql from 'graphql-tag';

export const typeDefs = gql`
  type TransactionParams {
    values: [String]
  }

  type Transaction {
    id: ID!
    fn: String
    name: String
    abi: String
    address: String
    completed: Boolean
    sent: Boolean
    hash: String
    error: String
    gasLimit: String
    gasPrice: String
    scaleGasEstimate: String
    minimumGas: String
    blockNumber: Float
    params: TransactionParams
    value: String
  }

  extend type Query {
    transactions(id: String): [Transaction]
  }

  extend type Mutation {
    sendTransaction(
      abi: String,
      name: String,
      address: String,
      fn: String,
      params: TransactionParams,
      gasLimit: String,
      gasPrice: String,
      value: String,
      scaleGasEstimate: String,
      minimumGas: String
    ): Transaction
  }
`;