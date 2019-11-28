import { accountQuery } from '../queries/accountQuery'
import { networkIdQuery } from '../queries/networkIdQuery'
import { ethereumPermissionQuery } from '../queries/ethereumPermissionQuery'

/**
 * Creates Apollo GraphQL subscriptions to watch for changes to the web3
 * browser network and refresh the page when an account or network is changed
 *
 * @returns {undefined}
 */
export function watchNetworkAndAccount (apolloClient) {
  // If the user signs in to MetaMask or logs out, we should ... (refresh the page?)
  apolloClient.watchQuery({
    query: accountQuery,
    pollInterval: 2000,
    fetchPolicy: 'network-only'
  }).subscribe()

  // This subscription listens for changes to a web3 browser (ie metamask's) network
  apolloClient.watchQuery({
    query: networkIdQuery,
    pollInterval: 2000,
    fetchPolicy: 'network-only'
  }).subscribe()

  apolloClient.watchQuery({
    query: ethereumPermissionQuery,
    pollInterval: 1000,
    fetchPolicy: 'network-only'
  }).subscribe()
}
