import { accountResolver } from '../accountResolver'

describe('accountResolver', () => {

  let signer, provider, providerSource

  beforeEach(async () => {
    signer = {
      getAddress: jest.fn(() => Promise.resolve('0x1234'))
    }
    provider = {
      getSigner: jest.fn(() => signer)
    }
    providerSource = jest.fn(() => Promise.resolve(provider))
  })

  it('should work', async () => {
    expect(await accountResolver(providerSource)).toEqual('0x1234')
  })
})