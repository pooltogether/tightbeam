// Weird empty export because of:
// https://medium.com/@muravitskiy.mail/cannot-redeclare-block-scoped-variable-varname-how-to-fix-b1c3d9cc8206
export {};

const { bindMutationResolvers } = require('../bindMutationResolvers')
const mutations = require('../mutations')

jest.mock('../mutations')

describe('bindMutationResolvers', () => {

  let mutationResolvers

  beforeEach(() => {
    mutationResolvers = bindMutationResolvers('contractCache', 'providerSource')
  })

  describe('sendTransaction', () => {
    it('should build a function that proxies calls and iterates', () => {
      mutationResolvers.sendTransaction('opts', 'args', 'context', 'info')
      expect(mutations.sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 1, 'opts', 'args', 'context', 'info')
  
      mutationResolvers.sendTransaction('opts', 'args', 'context', 'info')
      expect(mutations.sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 2, 'opts', 'args', 'context', 'info')
    })

    it('should not be affected by another instance', () => {
      const mr2 = bindMutationResolvers('contractCache', 'providerSource')
      mr2.sendTransaction('opts', 'args', 'context', 'info')
      expect(mutations.sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 1, 'opts', 'args', 'context', 'info')

      mutationResolvers.sendTransaction('opts', 'args', 'context', 'info')
      expect(mutations.sendTransactionResolver).toHaveBeenCalledWith('contractCache', 'providerSource', 1, 'opts', 'args', 'context', 'info')
    })
  })
})