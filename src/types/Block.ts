import { Block as EthersBlock } from 'ethers/providers'

export interface Block extends EthersBlock {
  __typename: string
  id: number
}