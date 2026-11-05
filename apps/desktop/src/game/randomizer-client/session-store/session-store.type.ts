/* @layer bridge-wasm @kind types */
import type { OnlineSession } from '@drizztdourden08/brock-randomizer/session';
import type { ForeignOwners, LocalSession, Placement } from '@rotp/randomizer';

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
