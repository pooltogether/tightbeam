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

# Usage

The simplest way to get started is to attach the Tightbeam resolvers to ApolloClient:

```javascript

import { Tightbeam } from 'tightbeam'

const tb = new Tightbeam()

const cache = new InMemoryCache()

// Ensure that the expected defaults are present
cache.writeData(tb.defaultCacheData())

const httpLink = createHttpLink({
  uri: CHAIN_URIS[DEFAULT_CHAIN_ID]
});

// Now attach the Tightbeam resolvers
const stateLink = withClientState({
  cache,
  resolvers: tb.resolvers()
})

client = new ApolloClient({
  cache,
  link: ApolloLink.from([stateLink, httpLink])
})

```

The `defaultCacheData()` function takes one optional argument that is your desired default state.  It will merge the two.

The `resolvers()` function takes one optional argument of resolvers.  It will merge the Tightbeam resolvers into the passed object.

Now you can talk to Ethereum!

# Querying for Network, Account

Let's query for the current network and account:

```javascript

const result = await client.query({
  query: gql`
    query addressAndNetwork {
      address @client
      network @client
    }
  `
})

console.log(result)
/*

{
  address: "0x1234...",
  network: { 
    name: 'homestead',
    chainId: 1
  }
}

*/
```

Notice the `@client` directive; this tells Apollo Client that we are querying a client resolver.

# Querying a Contract

To query a contract, you must first add a contract to the abi mapping:

```javascript
const erc20Abi = // ... get the abi from some where

// addContract(name, networkId, address, abi)
tb.abiMapping.addContract('Dai', 1, '0x6b175474e89094c44da98b954eedeac495271d0f', erc20Abi)
```

Now you can query functions:

```javascript
const result = await client.query({
  query: gql`
    query daiQuery {
      name: call(name: Dai, fn: name) @client
      totalSupply: call(name: Dai, fn: totalSupply) @client
    }
  `
})
```

We can ask for our balance as well:

```javascript
const result = await client.query({
  query: gql`
    query myBalanceQuery($address: String!) {
      balance: call(name; Dai, fn: balanceOf, params[$address]) @client
    }
  `,
  variables: {
    address: '0xc73e0383f3aff3215e6f04b0331d58cecf0ab849'
  }
})
```

The query defines an `address` variable that can configure the call.

