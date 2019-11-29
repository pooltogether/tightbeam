import { buildFilter } from '../buildFilter'
import { abi } from '../../__mocks__/abi'

const { ethers } = jest.requireActual('ethers')

describe('buildFilter', () => {

  let ethersInterface

  beforeEach(() => {
    ethersInterface = new ethers.utils.Interface(abi)
  })

  it('should accept specific event names', () => {

    const filter = buildFilter(
      '0x1234',
      ethersInterface,
      {
        event: 'Transfer'
      }
    )

    expect(filter).toMatchObject({
      address: '0x1234',
      fromBlock: 0,
      toBlock: 'latest',
      topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
    })
  })

  it('should accept allEvents', () => {

    const filter = buildFilter(
      '0x1234',
      ethersInterface,
      {
        event: 'allEvents',
      }
    )

    expect(filter).toMatchObject({
      address: '0x1234',
      fromBlock: 0,
      toBlock: 'latest',
      topics: [null]
    })
  })

  it('should accept null event as all events', () => {

    const filter = buildFilter(
      '0x1234',
      ethersInterface,
      {}
    )

    expect(filter).toMatchObject({
      address: '0x1234',
      fromBlock: 0,
      toBlock: 'latest',
      topics: [null]
    })
  })

  it('should accept passed topics', () => {

    const filter = buildFilter(
      '0x1234',
      ethersInterface,
      {
        topics: {
          types: ['uint256'],
          values: ['4234']
        }
      }
    )

    expect(filter).toMatchObject({
      address: '0x1234',
      fromBlock: 0,
      toBlock: 'latest',
      topics: ['0x000000000000000000000000000000000000000000000000000000000000108a']
    })
  })

  it('should accept the toBlock', () => {

    const filter = buildFilter(
      '0x1234',
      ethersInterface,
      {
        toBlock: 1234
      }
    )

    expect(filter).toMatchObject({
      address: '0x1234',
      fromBlock: 0,
      toBlock: 1234,
      topics: [null]
    })
  })

  it('should accept extra topics and append them', () => {

    const filter = buildFilter(
      '0x1234',
      ethersInterface,
      {
        toBlock: 1234,
        extraTopics: {
          types: ['uint256'],
          values: ['4234']
        }
      }
    )

    expect(filter).toMatchObject({
      address: '0x1234',
      fromBlock: 0,
      toBlock: 1234,
      topics: [null, '0x000000000000000000000000000000000000000000000000000000000000108a']
    })
  })

  it('should fail when the event doesnt  exist', () => {
    expect(() => {
      buildFilter(
        '0x1234',
        ethersInterface,
        {
          event: 'asdf'
        }
      )
    }).toThrow(new Error('No event called asdf'))
  })
})