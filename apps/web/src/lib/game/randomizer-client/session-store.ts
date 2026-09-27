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
import type { ForeignOwners } from './foreign-item-line';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

type ActiveSession = LocalSession | OnlineSession;
type SessionSource = 'profile' | 'manual';

interface SessionStoreState {
  session: ActiveSession | null;
  placement: Placement | null;
  /** Online only: location → the player whose item it holds. Empty for every other run. */
  foreignOwners: ForeignOwners;
  source: SessionSource | null;
}

interface PendingBoot {
  profileId: string;
  config: ProfileRandomizerConfig;
  /** Loaded (or legacy-adapted) by the boot gate for local mode; null for online mode. */
  placement: Placement | null;
}

type SessionStoreListener = (state: SessionStoreState) => void;

const NO_OWNERS: ForeignOwners = {};

let session: ActiveSession | null = null;
let placement: Placement | null = null;
let foreignOwners: ForeignOwners = NO_OWNERS;
let source: SessionSource | null = null;
let unsubscribeStatus: (() => void) | null = null;
let pendingBoot: PendingBoot | null = null;
const listeners = new Set<SessionStoreListener>();

const getSessionState = (): SessionStoreState => ({ session, placement, foreignOwners, source });

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

/** An online session's placement describes its room, so it goes when the room does. */
const dropOnlinePlacement = (): void => {
  placement = null;
  foreignOwners = NO_OWNERS;
};

/**
 * Releases the active slot. An online session takes its placement with it: left behind, it
 * would read as a local seed (run-kind.ts).
 */
const clearActive = (): void => {
  unsubscribeStatus?.();
  unsubscribeStatus = null;
  if (session?.kind === 'online') dropOnlinePlacement();
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
    // An online error is its end too; the session stays so the page can show the error.
    if (status === 'error' && session === next && next.kind === 'online') dropOnlinePlacement();
    notify();
  });
  notify();
};

const startLocalFromPlacement = async (nextPlacement: Placement, nextSource: SessionSource): Promise<void> => {
  const next = createLocalSession(nextPlacement);
  placement = nextPlacement;
  foreignOwners = NO_OWNERS;
  adopt(next, nextSource);
  await next.start();
};

const startOnline = async (config: OnlineSessionConfig, nextSource: SessionSource): Promise<void> => {
  const next = createOnlineSession(config);
  placement = null;
  foreignOwners = NO_OWNERS;
  adopt(next, nextSource);
  // The scouts become the session's placement once armed, so the Spoiler tab reads it as
  // it reads a local seed's. It goes when the session stops (clearActive).
  next.onPlacement((scouted, owners) => {
    if (session !== next) return;
    placement = scouted;
    foreignOwners = owners;
    notify();
  });
  await next.start();
};

const setPendingBoot = (next: PendingBoot): void => { pendingBoot = next; };
const getPendingBoot = (): PendingBoot | null => pendingBoot;
const clearPendingBoot = (): void => { pendingBoot = null; };

/**
 * Back to no session at all: what a profile load runs before it gates, so nothing of the
 * profile that came before survives into it.
 *
 * The placement is the part that used to: stopActive releases a local session but leaves
 * its placement standing, since a stopped seed should still be able to show its spoiler.
 * Nothing ever cleared it, so it outlived its own profile, and the tracker went on listing a
 * seed's locations for a normal profile that has none.
 */
const resetSession = (): void => {
  clearPendingBoot();
  stopActive();
  if (placement === null) return;
  placement = null;
  foreignOwners = NO_OWNERS;
  notify();
};

export {
  clearPendingBoot, getPendingBoot, getSessionState, resetSession, setPendingBoot,
  startLocalFromPlacement, startOnline, stopActive, subscribeSessionStore,
};
export type { ActiveSession, PendingBoot, SessionSource, SessionStoreState };
