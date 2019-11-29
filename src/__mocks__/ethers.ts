const ethersOriginal = jest.requireActual('ethers')

export const ethers = {
  utils: {
    Interface: jest.fn(),
    bigNumberify: ethersOriginal.utils.bigNumberify,
    defaultAbiCoder: ethersOriginal.utils.defaultAbiCoder
  },
  Contract: jest.fn()
}