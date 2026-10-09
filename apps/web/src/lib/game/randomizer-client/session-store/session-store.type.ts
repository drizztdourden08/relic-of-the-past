/* @layer bridge-wasm @kind types */
import type { LocalSession } from '../local-session';
import type { OnlineSession } from '../online-session';
import type { ForeignOwners } from '../foreign-item-line';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

type ActiveSession = LocalSession | OnlineSession;
type SessionSource = 'profile' | 'manual';

interface SessionStoreState {
  session: ActiveSession | null;
  placement: Placement | null;
  foreignOwners: ForeignOwners;
  source: SessionSource | null;
}

interface PendingBoot {
  profileId: string;
  config: ProfileRandomizerConfig;
  placement: Placement | null;
}

type SessionStoreListener = (state: SessionStoreState) => void;

interface SessionStoreSlots extends SessionStoreState {
  unsubscribeStatus: (() => void) | null;
  unsubscribeNetwork: (() => void) | null;
  pendingBoot: PendingBoot | null;
  readonly listeners: Set<SessionStoreListener>;
}

export type {
  ActiveSession, PendingBoot, SessionSource, SessionStoreListener, SessionStoreSlots, SessionStoreState,
};
