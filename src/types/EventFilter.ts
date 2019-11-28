import { EventTopics } from "./EventTopics";

export interface EventFilter {
  abi?: string,
  address?: string,
  name?: string,
  event?: string,
  params?: Array<string>,
  fromBlock?: string | number,
  toBlock?: string | number,
  topics?: EventTopics,
  extraTopics?: EventTopics
}