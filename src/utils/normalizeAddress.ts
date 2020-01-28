import { ethers } from "ethers"

export function normalizeAddress(
  address: string
): string {
  try {
    if (address) {
      address = ethers.utils.getAddress(address)
    }
  } catch (e) {
    throw new Error(`Unable to normalize address: ${address}`)
  }

  return address
}
