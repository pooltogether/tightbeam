# tightbeam

[![CircleCI](https://circleci.com/gh/pooltogether/tightbeam.svg?style=svg)](https://circleci.com/gh/pooltogether/tightbeam)

[Test Coverage](https://coverage.tightbeam.pooltogether.com)

[API Reference](https://docs.tightbeam.pooltogether.com)

This module makes connecting a web application to Ethereum dead easy.

Tightbeam provides [Ethers.js](https://github.com/ethers-io/ethers.js) bindings for [Apollo Client](https://github.com/apollographql/apollo-client).

Here is an example using Apollo Client directly:

```javascript
const result = await client.readQuery({
  query: gql`
    query dai($address: String!) {
      totalSupply: call(name: Dai, fn: totalSupply) @client
      myBalance: call(name: Dai, fn: balanceOf, params: [$address]) @client
    }
  `,
  variables: {
    address: "0xb2930b35844a230f00e51431acae96fe543a0347"
  }
})

console.log(result.dai.totalSupply)
console.log(result.dai.myBalance)
```

# Installation

Tightbeam is published under the scoped package `@pooltogether/tightbeam`.

Within a project you can install it:

```
$ yarn add @pooltogether/tightbeam
```

## Dependencies

| Tested Dependency | Version |
| ----------        | ------- |
| [Ethers.js](https://github.com/ethers-io/ethers.js)                     | 4.x     |
| [Apollo Client](https://github.com/apollographql/apollo-client)         | 2.6.x   |
| [Apollo Link State](https://github.com/apollographql/apollo-link-state) | 0.4.x   |

**Note:** The latest version of Apollo Client doesn't handle errors correctly when using client resolvers.  See [issue 4575](https://github.com/apollographql/apollo-client/issues/4575).  Errors will be swallowed.

Instead, we recommended that you stick with Apollo Link State until the client has been updated.
