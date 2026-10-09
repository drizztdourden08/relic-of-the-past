/* @layer bridge-wasm @kind logic */
import type { NetworkStatus } from '../network-status.type';
import { lastNetworkState } from './last-network-state';

const rememberNetworkStatus = (status: NetworkStatus): void => { lastNetworkState.status = status; };

export { rememberNetworkStatus };
