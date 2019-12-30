const { bindQueryResolvers } = require('../bindQueryResolvers')

const queries = require('../queries')

jest.mock('../queries')
jest.mock('../mutations/sendTransactionResolver')

describe('bindQueryResolvers', () => {

  let contractCache, providerSource, defaultFromBlock

  beforeEach(() => {
      providerSource = 'providerSource'
      contractCache = 'contractCache'
      defaultFromBlock = 'defaultFromBlock'
  })

  it('should bind account', () => {
    bindQueryResolvers(contractCache, providerSource, defaultFromBlock).account('a', 'b', 'c', 'd')
    expect(queries.accountResolver).toHaveBeenCalledWith('providerSource')
  })

  it('should bind block', () => {
    bindQueryResolvers(contractCache, providerSource, defaultFromBlock).block('a', 'b', 'c', 'd')
    expect(queries.blockResolver).toHaveBeenCalledWith('providerSource', 'a', 'b', 'c', 'd')
  })

  it('should bind call', () => {
    bindQueryResolvers(contractCache, providerSource, defaultFromBlock).call('a', 'b', 'c', 'd')
    expect(queries.callResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 'a', 'b', 'c', 'd')
  })

  it('should bind network', () => {
    bindQueryResolvers(contractCache, providerSource, defaultFromBlock).network('a', 'b', 'c', 'd')
    expect(queries.networkResolver).toHaveBeenCalledWith('providerSource')
  })

  it('should bind pastEvents', () => {
    bindQueryResolvers(contractCache, providerSource, defaultFromBlock).pastEvents('a', 'b', 'c', 'd')
    expect(queries.pastEventsResolver).toHaveBeenCalledWith(
      "contractCache",
      "providerSource",
      "defaultFromBlock",
      'a',
      'b',
      'c',
      'd'
    )
  })
})