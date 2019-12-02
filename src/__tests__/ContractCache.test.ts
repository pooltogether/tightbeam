import { ContractCache } from '../ContractCache'
import { AbiMapping } from '../abis/AbiMapping'
import { ethers } from 'ethers'

describe('ContractCache', () => {

  let abiMapping
  let providerCb
  let cache

  let abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    }
  ]

  const abi2 = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  

  beforeEach(async () => {
    abiMapping = new AbiMapping()
    abiMapping.addContract('Foo', 1234, '0xabcd', abi)

    let provider = {
      getNetwork: jest.fn(() => Promise.resolve({ chainId: 1234 }))
    }

    providerCb = jest.fn(() => Promise.resolve(provider))

    // @ts-ignore
    cache = new ContractCache(abiMapping, providerCb)
  })

  describe('constructor', () => {
    it('should throw when no abiMapping passed', () => {
      // @ts-ignore
      expect(() => new ContractCache(null, providerCb)).toThrow(/abiMapping must be defined/)
    })

    it('should throw when no provider passed', () => {
      // @ts-ignore
      expect(() => new ContractCache(abiMapping)).toThrow(/provider source must be defined/)
    })
  })

  describe('getContractByName()', () => {
    it('should retrieve a contract', async () => {
      const result = await cache.getContractByName('Foo')
      expect(result).toBeInstanceOf(ethers.Contract)

      // and ensure it reuses the contract
      let result2 = await cache.getContractByName('Foo')
      expect(result).toBe(result2)
    })

    it('should fail if contract name is not passed', async () => {
      await expect(cache.getContractByName()).rejects.toEqual(new Error('Contract name must be defined'))
    })

    it('should fail if contract name does not exist', async () => {
      await expect(cache.getContractByName('Blarg')).rejects.toEqual(new Error('Cannot find address for Blarg and chain id 1234'))
    })
  })

  describe('getContractByAddress()', () => {
    it('should retrieve a contract', async () => {
      const result = await cache.getContractByAddress('0xabcd')
      expect(result).toBeInstanceOf(ethers.Contract)
    })

    it('should fail if no address is passed', async () => {
      await expect(cache.getContractByAddress()).rejects.toEqual(new Error('Address must be defined'))
    })

    it('should fail if the contract does not exist', async () => {
      await expect(cache.getContractByAddress('0x1234')).rejects.toEqual(new Error('Could not find contract for address 0x1234 and chain id 1234'))
    })
  })

  describe('getAbiInterfaceByName()', () => {
    beforeEach(async () => {
      abiMapping.addAbi('Abby', abi)
    })

    it('should return the correct abi interface', async () => {
      const result = await cache.getAbiInterfaceByName('Abby')
      expect(result).toBeInstanceOf(ethers.utils.Interface)

      // should reuse
      const result2 = await cache.getAbiInterfaceByName('Abby')
      expect(result).toBe(result2)
    })

    it('should throw when abi missing', async () => {
      await expect(cache.getAbiInterfaceByName('Abber')).rejects.toEqual(new Error('Could not find abi for name Abber'))
    })
  })

  describe('resolveContract()', () => {
    beforeEach(() => {
      abiMapping.addAbi('Hello', abi2)
      abiMapping.addContract('Hello', 1234, '0xabcd', abi)
    })

    it('should fail when no params are passed', async () => {
      await expect(cache.resolveContract({})).rejects.toEqual(new Error(`abi, address or name must be defined`))
    })

    describe('when passing an abi', () => {
      it('should use the abi first', async () => {
        const result = await cache.resolveContract({ abi: 'Hello', name: 'Hello', address: '0x1234' })
  
        expect(result).toBeInstanceOf(ethers.Contract)
      })
  
      it('should require an address', async () => {
        await expect(cache.resolveContract({ abi: 'Hello' })).rejects.toEqual(new Error('abi Hello selected but no address passed'))
      })
    })

    describe('when passing a contract name', () => {
      it('should use the abi first', async () => {
        const result = await cache.resolveContract({ name: 'Hello' })
  
        // NOTE: this is a problem.  Here we really need to test that we're setting the right values
        expect(result).toBeInstanceOf(ethers.Contract)
      })
    })

    describe('when passing an address', () => {
      it('should use the abi first', async () => {
        const result = await cache.resolveContract({ address: '0xabcd' })
  
        expect(result).toBeInstanceOf(ethers.Contract)
      })
    })
  })
})