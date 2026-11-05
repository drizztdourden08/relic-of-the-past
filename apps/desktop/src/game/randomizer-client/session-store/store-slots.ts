/* @layer bridge-wasm @kind logic */
import { NO_OWNERS } from '@rotp/randomizer';
import type { ForeignOwners } from '@rotp/randomizer';
import type { ActiveSession, SessionSource, SessionStoreListener } from './session-store.type';

interface StoreSlots {
  source: SessionSource | null;
  foreignOwners: ForeignOwners;
  readonly listeners: Set<SessionStoreListener>;
  readonly unwire: Map<ActiveSession, () => void>;
}

const storeSlots: StoreSlots = {
  source: null,
  foreignOwners: NO_OWNERS,
  listeners: new Set(),
  unwire: new Map(),
};

export { storeSlots };
