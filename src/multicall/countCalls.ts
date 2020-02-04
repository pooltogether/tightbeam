import graphql from 'graphql-anywhere'

export function countCalls(document) {
  const context = {
    count: 0
  }

  function resolver(fieldName, rootValue, args, context, info) {
    const { directives } = info
    if (fieldName === 'call' && directives && 'client' in directives) {
      context.count++
    }
  }

  graphql(resolver, document, null, context)

  return context.count
}

