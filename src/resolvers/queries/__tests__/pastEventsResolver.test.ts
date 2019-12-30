const { pastEventsResolver } = require('../pastEventsResolver')

jest.mock('../../../services/buildFilter')

const { buildFilter } = require('../../../services/buildFilter')

describe('pastEventsResolver', () => {

  let contract,
    contractCache,
    provider,
    providerSource,
    logs,
    defaultFromBlock

  beforeEach(async () => {
    logs = ['log1']
    defaultFromBlock = 10
    provider = {
      getLogs: jest.fn(() => logs)
    }
    contract = {
      address: '0x1234',
      interface: {
        parseLog: jest.fn(() => 'parsedEvent')
      }
    }
    contractCache = {
      resolveContract: jest.fn(() => contract)
    }
    providerSource = jest.fn(() => 
      Promise.resolve(provider)
    )
  })

  it('should work', async () => {
    const filter = {
      name: 'Foo',
      event: 'allEvents',
      address: '0x1234'
    }

    const pastEvents = await pastEventsResolver(
      contractCache,
      providerSource,
      defaultFromBlock,
      {},
      filter
    )

    expect(pastEvents).toEqual([
      {
        log: 'log1',
        event: 'parsedEvent'
      }
    ])

    expect(buildFilter).toHaveBeenCalledWith(
      '0x1234',
      contract.interface,
      {
        ...filter,
        fromBlock: 10
      }
    )
  })
})