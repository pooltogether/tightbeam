import { Log } from "ethers/providers";
import { LogDescription } from "ethers/utils";

export interface LogEvent {
  log: Log
  event: LogDescription
}
