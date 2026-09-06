/* @layer bridge-wasm @kind types */
/**
 * Randomizer session contract — the surface a session mode exposes to the
 * location poller and the UI. A local session resolves a reported check from
 * its own placement table; an online session forwards it to the server.
 */

interface RandomizerSession {
  start(): Promise<void>;
  stop(): void;
  /** Poller → session: a planned location just completed in live memory (keyed by its standard name). */
  reportCheck(locationName: string): void;
  readonly kind: 'local' | 'online';
  readonly status: 'idle' | 'starting' | 'active' | 'error';
}

type SessionStatusListener = (status: RandomizerSession['status']) => void;

export type { RandomizerSession, SessionStatusListener };
