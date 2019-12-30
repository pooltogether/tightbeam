const { bindMutationResolvers } = require('../bindMutationResolvers')
const { sendTransactionResolver } = require('../mutations/sendTransactionResolver')
jest.mock('../mutations/sendTransactionResolver')

describe('bindMutationResolvers', () => {

  let mutationResolvers

  beforeEach(() => {
    mutationResolvers = bindMutationResolvers('contractCache', 'providerSource')
  })

  describe('sendTransaction', () => {
    it('should build a function that proxies calls and iterates', () => {
      mutationResolvers.sendTransaction('opts', 'args', 'context', 'info')
      expect(sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 1, 'opts', 'args', 'context', 'info')
  
      mutationResolvers.sendTransaction('opts', 'args', 'context', 'info')
      expect(sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 2, 'opts', 'args', 'context', 'info')
    })
  })
})