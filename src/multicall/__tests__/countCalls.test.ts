import { countCalls } from '../countCalls'
import gql from 'graphql-tag'

describe('countCalls', () => {
  it('should count any @client directives whose resolver is call', async () => {

    const query = gql`
      query testQuery {
        alias: call(foo: "bar") @client
      }
    `

    expect(countCalls(query)).toEqual(1)
  })

  it('should not match resolvers missing the @client directive', async () => {

    const query = gql`
      query testQuery {
        alias: call(foo: "bar")
      }
    `

    expect(countCalls(query)).toEqual(0)
  })

  it('should not match resolvers missing the @client directive', async () => {

    const query = gql`
      query testQuery {
        call: call(foo: "bar")
      }
    `

    expect(countCalls(query)).toEqual(0)
  })
})