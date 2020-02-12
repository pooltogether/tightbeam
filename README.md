# Tightbeam

[![CircleCI](https://circleci.com/gh/pooltogether/tightbeam.svg?style=svg)](https://circleci.com/gh/pooltogether/tightbeam) [Test Coverage](https://coverage.tightbeam.pooltogether.com)

Tightbeam is an extension for [Apollo Client](https://github.com/apollographql/apollo-client) that allows you to communicate with Ethereum smart contracts.  

Features:

- Make calls to smart contracts.  Calls are batched using [Multicall](https://github.com/makerdao/multicall) when supported by the network.
- Get current network and account
- Get blocks
- Execute transactions

Apollo Client is a powerful framework that allows web applications to communicate with GraphQL servers. By leveraging it's powerful caching and the Multicall smart contract it's possible to build extremely fast Ethereum dApps.

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

# Setup

The simplest way to get started is to attach the Tightbeam resolvers to ApolloClient:

```javascript

import { Tightbeam } from 'tightbeam'

import { withClientState } from 'apollo-link-state'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'

const tb = new Tightbeam()

const cache = new InMemoryCache()

// Ensure that the expected defaults are present
cache.writeData(tb.defaultCacheData())

// Now attach the Tightbeam resolvers
const stateLink = withClientState({
  cache,
  resolvers: tb.resolvers()
})

const httpLink = createHttpLink({
  uri: 'https://thegraph.com/yourgraphurl'
});

client = new ApolloClient({
  cache,
  link: ApolloLink.from([stateLink, httpLink])
})

```

Note the use of `apollo-link-state`; it's required for multicall batching to work.

The `defaultCacheData()` function takes one optional argument that is your desired default state.  It will merge the two.

The `resolvers()` function takes one optional argument of resolvers.  It will merge the Tightbeam resolvers into the passed object.

Now you can talk to Ethereum!

# Usage

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

