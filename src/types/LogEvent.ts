import { ethers } from "ethers";

export interface LogEvent {
  log: ethers.providers.Log
  event: ethers.utils.LogDescription
}
