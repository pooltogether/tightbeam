const { bindQueryResolvers } = require('../bindQueryResolvers')

const queries = require('../queries')

jest.mock('../queries')
jest.mock('../mutations/sendTransactionResolver')

describe('bindQueryResolvers', () => {

  let contractCache, providerSource, txProviderSource, defaultFromBlock

  beforeEach(() => {
      providerSource = 'providerSource'
      txProviderSource = 'txProviderSource'
      contractCache = 'contractCache'
      defaultFromBlock = 'defaultFromBlock'
  })

  it('should bind account', () => {
    bindQueryResolvers(contractCache, providerSource, txProviderSource, defaultFromBlock).account('a', 'b', 'c', 'd')
    expect(queries.accountResolver).toHaveBeenCalledWith('txProviderSource')
  })

  it('should bind block', () => {
    bindQueryResolvers(contractCache, providerSource, txProviderSource, defaultFromBlock).block('a', 'b', 'c', 'd')
    expect(queries.blockResolver).toHaveBeenCalledWith('providerSource', 'a', 'b', 'c', 'd')
  })

  it('should bind call', () => {
    bindQueryResolvers(contractCache, providerSource, txProviderSource, defaultFromBlock).call('a', 'b', 'c', 'd')
    expect(queries.callResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 'a', 'b', 'c', 'd')
  })

  it('should bind contract', () => {
    bindQueryResolvers(contractCache, providerSource, txProviderSource, defaultFromBlock).contract('a', 'b', 'c', 'd')
    expect(queries.contractResolver).toHaveBeenCalledWith('contractCache', 'a', 'b', 'c', 'd')
  })

  it('should bind network', () => {
    bindQueryResolvers(contractCache, providerSource, txProviderSource, defaultFromBlock).network('a', 'b', 'c', 'd')
    expect(queries.networkResolver).toHaveBeenCalledWith('providerSource')
  })

  it('should bind pastEvents', () => {
    bindQueryResolvers(contractCache, providerSource, txProviderSource, defaultFromBlock).pastEvents('a', 'b', 'c', 'd')
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