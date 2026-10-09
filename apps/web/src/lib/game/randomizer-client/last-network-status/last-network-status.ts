/* @layer bridge-wasm @kind logic */
import type { NetworkStatus } from '../network-status.type';
import { lastNetworkState } from './last-network-state';

const lastNetworkStatus = (): NetworkStatus | null => lastNetworkState.status;

export { lastNetworkStatus };
