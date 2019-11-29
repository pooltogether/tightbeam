const { sendTransactionResolverFactory } = require('../sendTransactionResolverFactory')

const { sendTransactionResolver } = require('../sendTransactionResolver')
jest.mock('../sendTransactionResolver')

describe('sendTransactionResolverFactory', () => {
  it('should build a function that proxies calls and iterates', () => {
    const st = sendTransactionResolverFactory('contractCache', 'providerSource')

    st('opts', 'args', 'context', 'info')
    expect(sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 1, 'opts', 'args', 'context', 'info')

    st('opts', 'args', 'context', 'info')
    expect(sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 2, 'opts', 'args', 'context', 'info')
  })
})