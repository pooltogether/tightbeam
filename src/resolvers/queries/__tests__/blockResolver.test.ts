import { blockResolver } from '../blockResolver'
import { Block } from '../../../types/Block'

describe('blockResolver', () => {

  let provider, providerSource

  beforeEach(async () => {
    provider = {
      getBlock: jest.fn(() => ({ number: 42 }))
    }
    providerSource = jest.fn(() => Promise.resolve(provider))
  })

  it('should work', async () => {
    const block = await blockResolver(providerSource, {}, {}, {}, {})
    expect(block.number).toEqual(42)
    expect(block.id).toEqual(42)
  })
})