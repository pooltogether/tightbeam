const { accountResolver } = require('../accountResolver')

jest.mock('../../../utils/castToJsonRpcProvider')

describe('accountResolver', () => {

  let signer, provider, providerSource

  beforeEach(async () => {
    signer = {
      getAddress: jest.fn(() => Promise.resolve('0x1234'))
    }
    provider = {
      listAccounts: jest.fn(() => [1]),
      getSigner: jest.fn(() => signer)
    }
    providerSource = jest.fn(() => Promise.resolve(provider))
  })

  it('should work', async () => {
    expect(await accountResolver(providerSource)).toEqual('0x1234')
  })

  it('should handle signers that are missing accounts', async () => {
    signer.getAddress = () => { throw 'unknown account #0' }
    expect(await accountResolver(providerSource)).toEqual(null)
  })

  it('should handle when no accounts exist', async () => {
    provider.listAccounts = () => []
    expect(await accountResolver(providerSource)).toEqual(null)
  })
})