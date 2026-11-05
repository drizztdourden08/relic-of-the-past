/* @layer bridge-wasm @kind types */
import type { ForeignOwners } from '@rotp/randomizer';
import type { ActiveSession, SessionSource, SessionStoreListener } from './session-store.type';

interface StoreSlots {
  source: SessionSource | null;
  foreignOwners: ForeignOwners;
  readonly listeners: Set<SessionStoreListener>;
  readonly unwire: Map<ActiveSession, () => void>;
}

export type { StoreSlots };
