const { bindResolvers } = require('../bindResolvers')

const queries = require('../queries')

jest.mock('../queries')
jest.mock('../mutations/sendTransactionResolver')

describe('bindResolvers', () => {

  let tightbeam

  beforeEach(() => {
    tightbeam = {
      providerSource: 'providerSource',
      contractCache: 'contractCache',
      abiMapping: 'abiMapping'
    }
  })

  it('should bind account', () => {
    bindResolvers(tightbeam).Query.account('a', 'b', 'c', 'd')
    expect(queries.accountResolver).toHaveBeenCalledWith('providerSource')
  })

  it('should bind block', () => {
    bindResolvers(tightbeam).Query.block('a', 'b', 'c', 'd')
    expect(queries.blockResolver).toHaveBeenCalledWith('providerSource', 'a', 'b', 'c', 'd')
  })

  it('should bind call', () => {
    bindResolvers(tightbeam).Query.call('a', 'b', 'c', 'd')
    expect(queries.callResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 'a', 'b', 'c', 'd')
  })

  it('should bind network', () => {
    bindResolvers(tightbeam).Query.network('a', 'b', 'c', 'd')
    expect(queries.networkResolver).toHaveBeenCalledWith('providerSource')
  })

  it('should bind pastEvents', () => {
    bindResolvers(tightbeam).Query.pastEvents('a', 'b', 'c', 'd')
    expect(queries.pastEventsResolver).toHaveBeenCalledWith(
      'contractCache',
      null,
      {
        "abiMapping": "abiMapping",
        "contractCache": "contractCache",
        "providerSource": "providerSource"
      },
      'a',
      'b',
      'c',
      'd'
    )
  })
})