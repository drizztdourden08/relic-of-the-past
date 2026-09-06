/* @layer bridge-wasm @kind logic */
/**
 * Module-level singleton owning THE active randomizer session. Every start and
 * stop in the app routes through here, so the one-active-session invariant has
 * a single home; the page hook is only a subscriber. Also holds the pending
 * boot slot: a gated profile boot parks its session material here and the
 * auto-start hook consumes it once the game reports running.
 */
import { createLocalSession } from './local-session';
import { createOnlineSession } from './online-session';
import type { LocalSession } from './local-session';
import type { OnlineSession, OnlineSessionConfig } from './online-session';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

type ActiveSession = LocalSession | OnlineSession;
type SessionSource = 'profile' | 'manual';

interface SessionStoreState {
  session: ActiveSession | null;
  placement: ApPlacement | null;
  source: SessionSource | null;
}

interface PendingBoot {
  profileId: string;
  config: ProfileRandomizerConfig;
  /** Loaded (or legacy-adapted) by the boot gate for local mode; null for online mode. */
  placement: ApPlacement | null;
}

type SessionStoreListener = (state: SessionStoreState) => void;

let session: ActiveSession | null = null;
let placement: ApPlacement | null = null;
let source: SessionSource | null = null;
let unsubscribeStatus: (() => void) | null = null;
let pendingBoot: PendingBoot | null = null;
const listeners = new Set<SessionStoreListener>();

const getSessionState = (): SessionStoreState => ({ session, placement, source });

const notify = (): void => {
  const state = getSessionState();
  for (const listener of listeners) {
    try { listener(state); } catch { /* never let a bad listener break the store */ }
  }
};

const subscribeSessionStore = (listener: SessionStoreListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const clearActive = (): void => {
  unsubscribeStatus?.();
  unsubscribeStatus = null;
  session = null;
  source = null;
};

const stopActive = (): void => {
  if (!session) return;
  const active = session;
  clearActive();
  active.stop();
  notify();
};

const adopt = (next: ActiveSession, nextSource: SessionSource): void => {
  stopActive();
  session = next;
  source = nextSource;
  unsubscribeStatus = next.onStatusChange((status) => {
    // A session that winds down on its own (socket closed, stop from inside)
    // releases the active slot; every status change reaches subscribers.
    if (status === 'idle' && session === next) clearActive();
    notify();
  });
  notify();
};

const startLocalFromPlacement = async (nextPlacement: ApPlacement, nextSource: SessionSource): Promise<void> => {
  const next = createLocalSession(nextPlacement);
  placement = nextPlacement;
  adopt(next, nextSource);
  await next.start();
};

const startOnline = async (config: OnlineSessionConfig, nextSource: SessionSource): Promise<void> => {
  const next = createOnlineSession(config);
  placement = null;
  adopt(next, nextSource);
  await next.start();
};

const setPendingBoot = (next: PendingBoot): void => { pendingBoot = next; };
const getPendingBoot = (): PendingBoot | null => pendingBoot;
const clearPendingBoot = (): void => { pendingBoot = null; };

export {
  clearPendingBoot, getPendingBoot, getSessionState, setPendingBoot,
  startLocalFromPlacement, startOnline, stopActive, subscribeSessionStore,
};
export type { ActiveSession, PendingBoot, SessionSource, SessionStoreState };
