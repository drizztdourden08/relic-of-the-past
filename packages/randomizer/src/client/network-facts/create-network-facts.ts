/* @layer bridge-wasm @kind logic */
import type { NetworkFacts } from './network-facts.type';

const createNetworkFacts = (): NetworkFacts => ({
  url: null, seedName: null, serverVersion: null, generatorVersion: null, games: [], roomChecksums: {},
  passwordRequired: null, permissions: null, hintCostPercent: null, locationCheckPoints: null, hintPoints: null,
  uuid: null, deathLink: false, worldVersion: null, connectedAt: null, lastPacketAt: null, packetsIn: 0,
  packetsOut: 0, requestedGames: new Set(), fetchedChecksums: new Map(), itemsReceived: 0, scoutOwners: new Map(),
  sentChecks: new Set(), goalReported: false, reconnectAttempt: 0, nextRetryAt: null, retryInFlight: false,
  error: null,
});

export { createNetworkFacts };
