import {
  MulticallExecutor,
  MULTICALL_ADDRESS_MAINNET,
  MULTICALL_ADDRESS_KOVAN,
  MULTICALL_ADDRESS_RINKEBY,
  MULTICALL_ADDRESS_GOERLI,
  AGGREGATE_SELECTOR
} from '../MulticallExecutor'

describe('MulticallExecutor', () => {

  let executor

  let provider, providerSource, chainId

  beforeEach(() => {
    chainId = 1
    provider = {
      call: jest.fn(),
      getNetwork: jest.fn(() => Promise.resolve({
        chainId
      }))
    }
    providerSource = jest.fn(() => Promise.resolve(provider))
    executor = new MulticallExecutor(providerSource)
  })

  describe('execute()', () => {
    it('should execute against mainnet', async () => {
      chainId = 1
      await executor.execute('0x1234')
      expect(provider.call).toHaveBeenCalledWith({
        to: MULTICALL_ADDRESS_MAINNET,
        data: `${AGGREGATE_SELECTOR}1234`
      })
    })
  
    it('should execute against kovan', async () => {
      chainId = 42
      await executor.execute('0x1234')
      expect(provider.call).toHaveBeenCalledWith({
        to: MULTICALL_ADDRESS_KOVAN,
        data: `${AGGREGATE_SELECTOR}1234`
      })
    })
  
    it('should execute against rinkeby', async () => {
      chainId = 4
      await executor.execute('0x1234')
      expect(provider.call).toHaveBeenCalledWith({
        to: MULTICALL_ADDRESS_RINKEBY,
        data: `${AGGREGATE_SELECTOR}1234`
      })
    })
  
    it('should execute against goerli', async () => {
      chainId = 5
      await executor.execute('0x1234')
      expect(provider.call).toHaveBeenCalledWith({
        to: MULTICALL_ADDRESS_GOERLI,
        data: `${AGGREGATE_SELECTOR}1234`
      })
    })
  
    it('should fail with an unknown network', async () => {
      chainId = 888
      expect(executor.execute('0x1234')).rejects.toEqual(new Error('multicall is not available on the network 888'))
    })
  })

  describe('networkSupportsMulticall()', () => {
    it('should be true for mainnet', async () => {
      chainId = 1
      expect(await executor.networkSupportsMulticall()).toBeTruthy()
    })

    it('should be false otherwise', async () => {
      chainId = 999
      expect(await executor.networkSupportsMulticall()).toBeFalsy()
    })
  })
})
