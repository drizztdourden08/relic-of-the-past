/* @layer bridge-wasm @kind logic */
import type { NetworkFacts } from './network-facts.type';

const observeClose = (facts: NetworkFacts): void => {
  facts.connectedAt = null;
};

export { observeClose };
