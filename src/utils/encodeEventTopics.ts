import { defaultAbiCoder } from 'ethers/utils'
import { EventTopics } from '../types/EventTopics'

export function encodeEventTopics(extraTopics: EventTopics): Array<string> {
  let encodedEventTopics = []

  if (extraTopics.types.length !== extraTopics.values.length) {
    throw new Error(`extraTopics must have same number of types and values`)
  }

  for (let extraTopicIndex = 0; extraTopicIndex < extraTopics.types.length; extraTopicIndex++) {
    const type = extraTopics.types[extraTopicIndex]
    const value = extraTopics.values[extraTopicIndex]
    let encodedValue = null
    if (value) {
      encodedValue = defaultAbiCoder.encode([type], [value])
    }
    encodedEventTopics.push(encodedValue)
  }

  return encodedEventTopics
}