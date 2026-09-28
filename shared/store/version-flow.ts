/* @layer shared-store @kind logic */
/**
 * The one table of what a version may go through: for each state, the actions it allows,
 * the state each leads to, and who may take it. store-api guards its routes with it and the
 * store site shows only the buttons it allows, so the site never offers what the API refuses.
 */
import { STORE_LIMITS } from './limits';
import type { ReviewState } from './review-types';
import type { StoreVersion } from './types';

type VersionAction = 'submit' | 'withdraw' | 'approve' | 'reject' | 'delete' | 'abort';

/** The author of the item, or a holder of the store's review permission. */
type Actor = 'author' | 'reviewer';

type FlowStep = { to: ReviewState; by: readonly Actor[] };

/** Why an action is refused: the state has no such move, the caller may not take it, or the file is gone. */
type FlowRefusal = 'state' | 'actor' | 'file';

type FlowVersion = Pick<StoreVersion, 'review' | 'removed'>;

const AUTHOR: readonly Actor[] = ['author'];
const REVIEWER: readonly Actor[] = ['reviewer'];
const EITHER: readonly Actor[] = ['author', 'reviewer'];

const VERSION_FLOW: Record<ReviewState, Partial<Record<VersionAction, FlowStep>>> = {
  uploading: { abort: { to: 'deleted', by: EITHER } },
  ready: {
    submit: { to: 'waiting', by: AUTHOR },
    reject: { to: 'rejected', by: REVIEWER },
    delete: { to: 'deleted', by: EITHER },
  },
  waiting: {
    withdraw: { to: 'ready', by: AUTHOR },
    approve: { to: 'approved', by: REVIEWER },
    reject: { to: 'rejected', by: REVIEWER },
    delete: { to: 'deleted', by: EITHER },
  },
  rejected: {
    submit: { to: 'waiting', by: AUTHOR },
    delete: { to: 'deleted', by: EITHER },
  },
  approved: { delete: { to: 'deleted', by: REVIEWER } },
  deleted: {},
};

/** Actions that hand the file to a reviewer or to players, so the file must still be there. */
const NEEDS_FILE: readonly VersionAction[] = ['submit', 'approve'];

/** States that hold the item's one version in progress; a new version waits until none is left. */
const IN_FLIGHT: readonly ReviewState[] = ['uploading', 'ready', 'waiting'];

const DAY_MS = 24 * 60 * 60 * 1000;

const stepOf = (version: FlowVersion, action: VersionAction): FlowStep | null =>
  VERSION_FLOW[version.review.state][action] ?? null;

const refusalOf = (version: FlowVersion, action: VersionAction, actors: readonly Actor[]): FlowRefusal | null => {
  const step = stepOf(version, action);
  if (!step) return 'state';
  if (!step.by.some((actor) => actors.includes(actor))) return 'actor';
  if (NEEDS_FILE.includes(action) && version.removed) return 'file';
  return null;
};

const canAct = (version: FlowVersion, action: VersionAction, actors: readonly Actor[]): boolean =>
  refusalOf(version, action, actors) === null;

/** The actions these actors may take on the version, in the table's order. */
const actionsFor = (version: FlowVersion, actors: readonly Actor[]): VersionAction[] =>
  (Object.keys(VERSION_FLOW[version.review.state]) as VersionAction[]).filter((action) => canAct(version, action, actors));

/** A version with an upload in progress, ready or waiting, and its file still there. */
const isInFlight = (version: FlowVersion): boolean =>
  IN_FLIGHT.includes(version.review.state) && !version.removed;

type ExpiryVersion = FlowVersion & Pick<StoreVersion, 'createdAt'>;

/**
 * When the daily job removes the file of a rejected or ready version, or null when it keeps
 * it. A rejected file counts from the rejection, a ready one from the start of its upload.
 */
const fileExpiresAt = (version: ExpiryVersion): number | null => {
  if (version.removed) return null;
  const { state, decidedAt } = version.review;
  if (state === 'rejected') return (decidedAt ?? version.createdAt) + STORE_LIMITS.rejectedKeepDays * DAY_MS;
  if (state === 'ready') return version.createdAt + STORE_LIMITS.readyKeepDays * DAY_MS;
  return null;
};

export { VERSION_FLOW, stepOf, refusalOf, canAct, actionsFor, isInFlight, fileExpiresAt };
export type { VersionAction, Actor, FlowStep, FlowRefusal };
