import { eventSubscriber } from '../eventSubscriber'

describe('eventSubscriber', () => {

  let contract, contractCache, provider, providerSource, defaultFromBlock

  beforeEach(() => {
    contract = {
      address: '0x1234',
      interface: {
        parseLog: jest.fn(() => 'parsedLog')
      }
    }
    contractCache = {
      resolveContract: jest.fn(() => contract)
    }
    provider = {
      on: jest.fn(),
      removeListener: jest.fn()
    }
    providerSource = jest.fn(() => Promise.resolve(provider))
    defaultFromBlock = 0
  })

  it('should build the filter and attach to the provider', async () => {
    const subscriber = await eventSubscriber(contractCache, providerSource, defaultFromBlock, { name: 'Dai' })

    let next = jest.fn()
    let subscription = subscriber.subscribe(next)

    // expect that we attached to the Ethers provider event
    expect(provider.on).toHaveBeenCalledWith(
      expect.objectContaining({address: '0x1234'}),
      expect.any(Function)
    )

    // extract the callback that was created
    const subscriptionCb = provider.on.mock.calls[0][1]
    expect(subscriptionCb).toBeInstanceOf(Function)

    // fake an event
    subscriptionCb('log')

    // Ensure that our subscriber was called
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      log: 'log',
      event: 'parsedLog'
    }))

    // Ensure that we can unsubscribe
    subscription.unsubscribe()

    // the provider should have removed the listener
    expect(provider.removeListener).toHaveBeenCalledWith(
      expect.objectContaining({address: '0x1234'}),
      subscriptionCb
    )
  })
})