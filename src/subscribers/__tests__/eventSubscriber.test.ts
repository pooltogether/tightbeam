export {}

const { buildFilter } = require('../../services/buildFilter')
const { eventSubscriber } = require('../eventSubscriber')

jest.mock('../../services/buildFilter')

describe('eventSubscriber', () => {

  let contract, contractCache, logsObserver, observer, filter
  let next

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
    filter = {
      address: '0xabcde',
      topics: []
    }
    logsObserver = {
      subscribe: jest.fn((o) => {
        observer = o
        return 'unsubscribe'
      })
    }
    next = jest.fn()
    buildFilter.mockImplementation(() => filter)
  })

  it('should call resolveContract, build filter, then subscribe ', async () => {
    const subscriber = await eventSubscriber(contractCache, logsObserver, { name: 'Dai' })
    subscriber.subscribe(next)

    expect(contractCache.resolveContract).toHaveBeenCalledWith(expect.objectContaining({ name: 'Dai' }))

    expect(buildFilter).toHaveBeenCalledWith(
      '0x1234',
      contract.interface,
      {
        name: 'Dai'
      }
    )

    expect(logsObserver.subscribe).toHaveBeenCalledTimes(1)
    expect(observer).toBeDefined()
  })

  it('should ignore logs with incorrect addresses', async () => {
    const subscriber = await eventSubscriber(contractCache, logsObserver, { name: 'Dai' })
    subscriber.subscribe(next)

    // defined by the circuitous logsObserver.subscribe
    observer([
      {
        address: '0xabcd',
        topics: []
      }
    ])

    expect(next).not.toHaveBeenCalled()
  })

  it('should call next for logs with matching addresses', async () => {
    filter = {
      address: '0x1234ABcd',
      topics: [null]
    }

    const subscriber = await eventSubscriber(contractCache, logsObserver, { name: 'Dai' })
    subscriber.subscribe(next)

    const matchingLog = {
      address: '0x1234abCD',
      topics: []
    }

    // defined by the circuitous logsObserver.subscribe
    observer([
      matchingLog  
    ])

    expect(next).toHaveBeenCalledWith({
      event: 'parsedLog',
      log: matchingLog
    })
  })

  it('should not call next for logs with mismatched topics', async () => {
    filter = {
      address: '0x1234',
      topics: ['i am a specific fn']
    }

    const subscriber = await eventSubscriber(contractCache, logsObserver, { name: 'Dai' })
    subscriber.subscribe(next)

    const matchingLog = {
      address: '0x1234',
      topics: []
    }

    // defined by the circuitous logsObserver.subscribe
    observer([
      matchingLog  
    ])

    expect(next).not.toHaveBeenCalled()
  })

  it('should call next for logs with matching topics', async () => {
    filter = {
      address: '0x1234',
      topics: ['i am a specific fn', undefined]
    }

    const subscriber = await eventSubscriber(contractCache, logsObserver, { name: 'Dai' })
    subscriber.subscribe(next)

    const matchingLog = {
      address: '0x1234',
      topics: ['i am a specific fn']
    }

    // defined by the circuitous logsObserver.subscribe
    observer([
      matchingLog  
    ])

    expect(next).toHaveBeenCalledWith({
      event: 'parsedLog',
      log: matchingLog
    })
  })
})