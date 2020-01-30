const { contractResolver } = require('../contractResolver')

describe('contractResolver', () => {

  let contract, contractCache

  beforeEach(async () => {
    contract = {
      address: '0x1234',
      provider: {
        getNetwork: jest.fn(async () => ({ chainId: 42 }))
      }
    }
    contractCache = {
      resolveContract: jest.fn(() => contract)
    }
  })

  it('should work', async () => {
    const params = { name: 'ContractName', abi: 'callMe', address: '0x8f7F92e0660DD92ecA1faD5F285C4Dca556E433e' }
    expect(
      await contractResolver(contractCache, {}, params, {}, {})
    ).toEqual({
      __typename: 'Contract',
      id: `42@0x1234`,
      name: 'ContractName',
      chainId: 42,
      address: '0x1234'
    })

    expect(contractCache.resolveContract).toHaveBeenCalledWith(params)
  })
})