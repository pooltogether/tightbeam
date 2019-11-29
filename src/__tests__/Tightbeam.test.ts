import { Tightbeam } from '../Tightbeam'
import { AbiMapping } from '../abis/AbiMapping'
import { ContractCache } from '../ContractCache'
import { ethers } from 'ethers'

describe('Tightbeam', () => {
  describe('contructor()', () => {
    it('should not need args', () => {
      const tb = new Tightbeam()

      expect(tb.defaultFromBlock).toEqual(0)
      expect(tb.abiMapping).toBeInstanceOf(AbiMapping)
      expect(tb.contractCache).toBeInstanceOf(ContractCache)
    })

    it('should take args', () => {
      const abiMapping = new AbiMapping()
      const providerSource = async () => ethers.getDefaultProvider()

      const tb = new Tightbeam({
        defaultFromBlock: 10,
        abiMapping,
        providerSource
      })

      expect(tb.providerSource).toBe(providerSource)
      expect(tb.abiMapping).toBe(abiMapping)
    })
  })

  describe('resolvers()', () => {

    it("should return resolvers", () => {
      const tb = new Tightbeam()

      const resolvers = tb.resolvers()
      expect(resolvers).toHaveProperty('Query')
      expect(resolvers).toHaveProperty('Mutation')
    })

    it('should merge passed resolvers', () => {
      const tb = new Tightbeam()

      const resolvers = tb.resolvers({
        Query: {
          foo: () => 'hello'
        }
      })

      expect(resolvers).toHaveProperty('Query.foo')
      expect(resolvers).toHaveProperty('Query.call')
      expect(resolvers).toHaveProperty('Mutation.sendTransaction')
    })
  })

  describe('defaultCacheData()', () => {
    it('should return the default data', () =>  {
      const tb = new Tightbeam()

      expect(tb.defaultCacheData()).toEqual({
        data: {
          transactions: []
        }
      })
    })

    it('should merge other data', () => {
      const tb = new Tightbeam()

      expect(tb.defaultCacheData({ data: { foo: 'bar' }})).toEqual({
        data: {
          foo: 'bar',
          transactions: []
        }
      })
    })
  })
})