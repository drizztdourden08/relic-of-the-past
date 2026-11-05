/* @layer bridge-wasm @kind types */
import type { ForeignOwners, LocalSession, OnlineSession, Placement } from '@rotp/randomizer';

type ActiveSession = LocalSession | OnlineSession;
type SessionSource = 'profile' | 'manual';

interface SessionStoreState {
  session: ActiveSession | null;
  placement: Placement | null;
  foreignOwners: ForeignOwners;
  source: SessionSource | null;
}

type SessionStoreListener = (state: SessionStoreState) => void;

export type { ActiveSession, SessionSource, SessionStoreListener, SessionStoreState };
