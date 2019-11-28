import { networkResolver } from '../networkResolver'

describe('networkResolver', () => {

  let network, provider, providerSource

  beforeEach(async () => {
    network = { name: 'hello', chainId: 42 }
    provider = {
      getNetwork: jest.fn(() => network)
    }
    providerSource = jest.fn(() => Promise.resolve(provider))
  })

  it('should work', async () => {
    const network = await networkResolver(providerSource)
    expect(network).toMatchObject(network)
  })
})