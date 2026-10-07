/* @layer bridge-wasm @kind logic */
/**
 * The last network picture of the last online session, kept after the session ends (the game
 * stopped, the socket closed). The Network tab shows it as the last known state while no
 * session runs, and says so, instead of an empty page. Kept for this run of the app only.
 */
import type { NetworkStatus } from './network-status.type';

let last: NetworkStatus | null = null;

const rememberNetworkStatus = (status: NetworkStatus): void => { last = status; };

const lastNetworkStatus = (): NetworkStatus | null => last;

export { lastNetworkStatus, rememberNetworkStatus };
