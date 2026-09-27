/* @layer renderer-lib @kind logic */
/**
 * Resolves the session adapter once: the Electron one keeps the device token in the OS
 * keychain through IPC, and a host with no main process answers signed out. The choice is
 * whether `window.api` carries the hub channels.
 */
import type { HubSession } from './hub-session.type';
import { electronHubSession } from './hub-session.electron';
import { noHubSession } from './hub-session.none';

let cached: HubSession | null = null;

const getHubSession = (): HubSession => {
  if (!cached) cached = typeof window.api?.beginHubSignIn === 'function' ? electronHubSession : noHubSession;
  return cached;
};

export { getHubSession };
export type { HubSession };
