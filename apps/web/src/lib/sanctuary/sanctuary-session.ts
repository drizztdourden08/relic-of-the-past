/* @layer renderer-lib @kind logic */
/**
 * Resolves the Sanctuary session adapter once: the Electron one keeps the device token in
 * the OS keychain through IPC, and a host with no main process answers signed out. The
 * choice is whether `window.api` carries the Sanctuary channels.
 */
import type { SanctuarySession } from './sanctuary-session.type';
import { electronSanctuarySession } from './sanctuary-session.electron';
import { noSanctuarySession } from './sanctuary-session.none';

let cached: SanctuarySession | null = null;

const getSanctuarySession = (): SanctuarySession => {
  if (!cached) cached = typeof window.api?.beginSanctuarySignIn === 'function' ? electronSanctuarySession : noSanctuarySession;
  return cached;
};

export { getSanctuarySession };
export type { SanctuarySession };
