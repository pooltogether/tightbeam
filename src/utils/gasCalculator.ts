import { BigNumberish, BigNumber, bigNumberify } from "ethers/utils"

export function gasCalculator(
  gasLimit: BigNumberish,
  estimatedGasLimit: BigNumberish,
  scaleGasEstimate: BigNumberish,
  minimumGas: BigNumberish
  ): BigNumber {

  let result: BigNumber

  if (gasLimit) {
    result = bigNumberify(gasLimit)
  } else if (estimatedGasLimit) {
    result = bigNumberify(estimatedGasLimit)
    if (scaleGasEstimate) {
      result = bigNumberify(scaleGasEstimate).mul(result)
    }
  }

  if (minimumGas && result < minimumGas) {
    result = bigNumberify(minimumGas)
  }

  return result
}

