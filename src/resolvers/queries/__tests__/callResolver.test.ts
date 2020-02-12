import { callResolver } from '../callResolver'

describe('callResolver()', () => {

  let contract, providerSource, contractCache, provider

  beforeEach(() => {
    contract = {
      address: 'my_addy',
      interface: {
        functions: {
          callMe: {
            outputs: [{ name: 'firstValue', type: 'uint256' }],
            encode: jest.fn(() => 'encoded'),
            decode: jest.fn(() => [42])
          }
        }
      }
    }

    contractCache = {
      resolveContract: jest.fn(() => Promise.resolve(contract))
    }

    provider = {
      call: jest.fn(() => Promise.resolve('encoded_value'))
    }

    providerSource = () => Promise.resolve(provider)
  })

  it('should fail when fn does not exist', async () => {
    await expect(callResolver(contractCache, providerSource, {}, { name: 'ContractName', fn: 'funky' }, {}, {})).rejects.toEqual(new Error(`Unknown function funky for {"contract":"ContractName"}`))
  })

  it('should call when it works!', async () => {
    const result = await callResolver(contractCache, providerSource, {}, { name: 'ContractName', fn: 'callMe' }, {}, {})
    expect(result).toEqual(42)
    expect(contract.interface.functions.callMe.encode).toHaveBeenCalledWith([])
    expect(provider.call).toHaveBeenCalledWith(expect.objectContaining({data: 'encoded', to: 'my_addy'}))
  })

  it('should handle the strange array result', async () => {
    contract.interface.functions.callMe.outputs = [{ name: 'firstValue', type: 'uint256' }, { name: 'secondValue', type: 'boolean' }]

    let weirdResult = ['test', 'foo']
    // @ts-ignore
    weirdResult.firstValue = 'test'
    // @ts-ignore
    weirdResult.secondValue = 'foo'

    contract.interface.functions.callMe.decode = () => weirdResult

    const result = await callResolver(contractCache, providerSource, {}, { name: 'ContractName', fn: 'callMe' }, {}, {})
    expect(result).toEqual(expect.objectContaining({
      firstValue: 'test',
      secondValue: 'foo'
    }))
  })

  it('should call with params', async () => {
    const result = await callResolver(contractCache, providerSource, {}, { name: 'ContractName', fn: 'callMe', params: ['foo'] }, {}, {})
    expect(result).toEqual(42)
    expect(contract.interface.functions.callMe.encode).toHaveBeenCalledWith(['foo'])
  })

  it('should gracefully handle errors', async () => {
    provider.call = () => Promise.reject('error!')
    await expect(
      callResolver(contractCache, providerSource, {}, { name: 'ContractName', fn: 'callMe', params: ['foo'] }, {}, {})
    ).rejects.toEqual('{"contract":"ContractName"} callMe(["foo"]): error!')
  })
})