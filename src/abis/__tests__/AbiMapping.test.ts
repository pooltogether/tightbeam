import { AbiMapping } from '../AbiMapping'
import { AbiDefinition } from '../AbiDefinition'
import { abi } from '../../__mocks__/abi'

describe('AbiMapping', () => {
  const abiDef = new AbiDefinition(abi)

  let mapping

  beforeEach(() => {
    mapping = new AbiMapping()
  })

  describe('constructor()', () => {
    it('should not need arguments', () => {
      new AbiMapping()
    })
  })

  describe('addAbi()', () => {
    it('should require non-null name', () => {
      expect(() => {
        mapping.addAbi(null, abi)
      }).toThrow()
    })

    it('should require non-null abi', () => {
      expect(() => {
        mapping.addAbi('hello', null)
      }).toThrow()
    })

    it('should add an abi', () => {
      mapping.addAbi('hello', abi)

      expect(mapping.getAbiDefinition('hello')).toEqual(abiDef)
    })
  })

  describe('addContract()', () => {
    it('should require name', () => {
      expect(() => mapping.addContract(null, 1234, '0xabcd', abi)).toThrow(/name not defined/)
    })

    it('should require address', () => {
      expect(() => mapping.addContract('hello', 1234, null, abi)).toThrow(/address not defined/)
    })

    it('should require networkId', () => {
      expect(() => mapping.addContract('hello', null, '0xabcd', abi)).toThrow(/networkId not defined/)
    })

    it('should require abi', () => {
      expect(() => mapping.addContract('hello', 1234, '0xabcd', null)).toThrow(/abi not defined/)
    })

    it('should work', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)

      expect(mapping.getContractAddress('Vouching', 1234)).toEqual('0xabcde')
    })

    it('should override', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)
      mapping.addContract('Vouching', 1234, '0xabcde', abi)

      expect(mapping.getContractAddress('Vouching', 1234)).toEqual('0xabcde')

      mapping.addContract('Vouching', 1234, '0xffff', [])
      expect(mapping.getContractAddress('Vouching', 1234)).toEqual('0xffff')
    })
  })

  describe('getContractAbiDefinitionByAddress()', () => {
    it('should work', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)

      expect(mapping.getContractAbiDefinitionByAddress('0xabcde', 1234)).toEqual(abiDef)
    })

    it('should accept a bad address', () => {
      expect(mapping.getContractAbiDefinitionByAddress('0xabcde', 1234)).toEqual(undefined)
    })

    it('should accept a bad networkId', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)
      expect(mapping.getContractAbiDefinitionByAddress('0xabcde', 99)).toEqual(undefined)
    })
  })

  describe('getContractAbiDefinitionByName()', () => {
    it('should do nothing when the name does not exist', () => {
      expect(mapping.getContractAbiDefinitionByName('Vouching', 1234)).toEqual(undefined)
    })

    it('should do nothing when the network id is wrong', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)

      expect(mapping.getContractAbiDefinitionByName('Vouching', 1)).toEqual(undefined)
    })

    it('should work', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)

      expect(mapping.getContractAbiDefinitionByName('Vouching', 1234)).toEqual(abiDef)
    })
  })

  describe('getContractAddress()', () => {
    it('should do nothing when the address does not exist', () => {
      expect(mapping.getContractAddress('Vouching', 1234)).toEqual(undefined)
    })

    it('should do nothing when the network id is wrong', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)

      expect(mapping.getContractAddress('Vouching', 1)).toEqual(undefined)
    })

    it('should work', () => {
      mapping.addContract('Vouching', 1234, '0xabcde', abi)
      expect(mapping.getContractAddress('Vouching', 1234)).toEqual('0xabcde')
    })
  })

  describe('addTruffleArtifact()', () => {
    it('should add the artifact', () => {
      mapping.addTruffleArtifact({
        contractName: "Foo",
        abi,
        networks: {
          [1234]: {
            events: {},
            links: {},
            address: "0xdfC2FCFDE180eEd58B180Cbc50f4148f48581180",
            transactionHash: ""
          }
        }
      })

      expect(mapping.getContractAddress('Foo', 1234)).toEqual('0xdfC2FCFDE180eEd58B180Cbc50f4148f48581180')
    })
  })
})
