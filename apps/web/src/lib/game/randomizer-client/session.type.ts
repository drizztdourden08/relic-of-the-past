import type { LocationKey } from '@shared/randomizer/world/location-key';
/* @layer bridge-wasm @kind types */
/**
 * Randomizer session contract: the surface a session mode exposes to the
 * location poller and the UI. A local session resolves a reported check from
 * its own placement table; an online session forwards it to the server.
 */

interface RandomizerSession {
  start(): Promise<void>;
  stop(): void;
  /** Poller → session: a planned location just completed in live memory (keyed by its standard name). */
  reportCheck(location: LocationKey): void;
  readonly kind: 'local' | 'online';
  /** 'reconnecting' is online only: the server dropped or was never reached, and the session is retrying. */
  readonly status: 'idle' | 'starting' | 'active' | 'reconnecting' | 'error';
}

type SessionStatusListener = (status: RandomizerSession['status']) => void;

export type { RandomizerSession, SessionStatusListener };
