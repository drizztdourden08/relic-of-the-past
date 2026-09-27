/* @layer bridge-wasm @kind logic */
/**
 * Fire-id registry: the session-side half of the override-fired completion
 * channel. Each armed physical override entry carries a fire id allocated
 * here; when the core reports a substitution (override-fired.ts) the id maps
 * back to its location and the session reports the check, once. Sessions
 * reset the registry when they stop, together with the in-core tables the
 * ids point into.
 */

import type { LocationKey } from '@shared/randomizer/world/location-key';
import { log } from '../../log-bus';
import { armOverrideFiredEvents, disarmOverrideFiredEvents } from '../override-fired';
import { isSlotKey } from '@shared/randomizer/world/location-key';

type ReportingSession = { reportCheck(location: LocationKey): void };
type FiredLocationListener = (location: LocationKey) => void;

const locationByFireId = new Map<number, LocationKey>();
const armedCheckIds = new Set<LocationKey>();
const fired = new Set<number>();
const firedLocationKeys = new Set<LocationKey>();
const firedListeners = new Set<FiredLocationListener>();
let nextFireId = 0;

/** Allocate the completion id for one armed entry. */
const allocateFireId = (location: LocationKey): number => {
  const fireId = nextFireId;
  nextFireId += 1;
  locationByFireId.set(fireId, location);
  if (!isSlotKey(location)) armedCheckIds.add(location);
  return fireId;
};

/**
 * Whether the active session physically armed this check (npc/drop/standing
 * substitution). While true, its completion must be read from the real
 * substitution facts, never a possession-proxy detection.
 */
const isCheckPhysicallyArmed = (checkId: string): boolean => armedCheckIds.has(checkId as LocationKey);

/** Route substitution reports to the session, one report per entry. */
const armFireReporting = (session: ReportingSession): void => {
  armOverrideFiredEvents((fireId) => {
    const location = locationByFireId.get(fireId);
    if (location === undefined || fired.has(fireId)) return;
    fired.add(fireId);
    firedLocationKeys.add(location);
    log.randomizer(`[Override] Substitution fired: ${location}`);
    session.reportCheck(location);
    for (const listener of firedListeners) listener(location);
  });
};

/**
 * The locations whose substitution fired this session. A shelf slot and a
 * pond prize past the reference's two have no check record, so the tracker's
 * completed set never lists them; anything that counts completed locations
 * (the receipt lines' found/total numbers) reads these alongside it.
 */
const firedLocations = (): ReadonlySet<LocationKey> => firedLocationKeys;

/** Follow substitution reports as they land; returns the unsubscribe. */
const onFiredLocation = (listener: FiredLocationListener): () => void => {
  firedListeners.add(listener);
  return () => firedListeners.delete(listener);
};

/**
 * Backfills a substitution the core already recorded before this boot (a
 * shelf sold in an earlier session, per its persisted SRAM counter). No fire
 * id exists for a past purchase, so this bypasses the id ledger and reports
 * straight to the location set the live path also writes.
 */
const markLocationFired = (location: LocationKey): void => {
  if (firedLocationKeys.has(location)) return;
  firedLocationKeys.add(location);
  for (const listener of firedListeners) listener(location);
};

const disarmFireReporting = (): void => {
  disarmOverrideFiredEvents();
  locationByFireId.clear();
  armedCheckIds.clear();
  fired.clear();
  firedLocationKeys.clear();
  nextFireId = 0;
};

export {
  allocateFireId, armFireReporting, disarmFireReporting, firedLocations, isCheckPhysicallyArmed,
  markLocationFired, onFiredLocation,
};
