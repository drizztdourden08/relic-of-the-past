/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../world/location-key';

interface RandomizerSession {
  start(): Promise<void>;
  stop(): void;
  reportCheck(location: LocationKey): void;
  readonly kind: 'local' | 'online';
  readonly status: 'idle' | 'starting' | 'active' | 'reconnecting' | 'error';
}

type SessionStatusListener = (status: RandomizerSession['status']) => void;

export type { RandomizerSession, SessionStatusListener };
