import { ethers } from 'ethers'

export interface Block extends ethers.providers.Block {
  __typename: string
  id: number
}