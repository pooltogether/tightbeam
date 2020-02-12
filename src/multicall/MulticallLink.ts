import { ApolloLink } from 'apollo-link'
import { countCalls } from './countCalls'
import { ProviderSource } from '../types'
import { MulticallBatch } from './MulticallBatch'
import { MulticallExecutor } from './MulticallExecutor'

const debug = require('debug')('tightbeam:MulticallLink')

export class MulticallLink extends ApolloLink {
  private multicallExecutor: MulticallExecutor
 
  constructor(providerSource: ProviderSource) {
    super()
    this.multicallExecutor = new MulticallExecutor(providerSource)
  }

  request(operation, forward) {
    const multicallBatch = new MulticallBatch(this.multicallExecutor)
    const batchSize = countCalls(operation.query)
    debug(operation.operationName, { batchSize, batchId: multicallBatch.id })
    multicallBatch.setBatchSize(batchSize)
    operation.setContext((context) => ({
      multicallBatch,
      ...context
    }))
    const observer = forward(operation)
    return observer;
  }
}