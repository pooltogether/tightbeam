import { castToJsonRpcProvider } from '../castToJsonRpcProvider'

describe('castToJsonRpcProvider', () => {
  it('should handle null or undefined', () => {
    expect(() => castToJsonRpcProvider(null)).toThrow(/requires JsonRpcProvider/)
    expect(() => castToJsonRpcProvider(undefined)).toThrow(/requires JsonRpcProvider/)
  })

  it('should fail with an object that doesnt have getSigner', () => {
    // @ts-ignore
    expect(() => castToJsonRpcProvider('test')).toThrow(/requires JsonRpcProvider/)
  })
})
