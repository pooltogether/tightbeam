import { ethers } from "ethers"

export function gasCalculator(
  gasLimit: ethers.utils.BigNumberish,
  estimatedGasLimit: ethers.utils.BigNumberish,
  scaleGasEstimate: ethers.utils.BigNumberish,
  minimumGas: ethers.utils.BigNumberish
  ): ethers.utils.BigNumber {

  let result: ethers.utils.BigNumber

  if (gasLimit) {
    result = ethers.utils.bigNumberify(gasLimit)
  } else if (estimatedGasLimit) {
    result = ethers.utils.bigNumberify(estimatedGasLimit)
    if (scaleGasEstimate) {
      result = ethers.utils.bigNumberify(scaleGasEstimate).mul(result)
    }
  }

  if (minimumGas && result < minimumGas) {
    result = ethers.utils.bigNumberify(minimumGas)
  }

  return result
}

