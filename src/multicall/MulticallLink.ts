import { ApolloLink } from 'apollo-link'
import { countCalls } from './countCalls'
import { ProviderSource } from '../types'
import { MulticallBatch } from './MulticallBatch'

export class MulticallLink extends ApolloLink {
  private multicallBatch: MulticallBatch
 
  constructor(providerSource: ProviderSource) {
    super()
    this.multicallBatch = new MulticallBatch(providerSource)
  }

  request(operation, forward) {
    const context = operation.getContext()
    this.multicallBatch.reset(countCalls(operation.query))
    context.multicallBatch = this.multicallBatch
    const observer = forward(operation)
    return observer;
  }
}