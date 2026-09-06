/* @layer bridge-wasm @kind logic */
/**
 * Fire-id registry — the session-side half of the override-fired completion
 * channel. Each armed physical override entry carries a fire id allocated
 * here; when the core reports a substitution (override-fired.ts) the id maps
 * back to its location and the session reports the check, once. Sessions
 * reset the registry when they stop, together with the in-core tables the
 * ids point into.
 */

import { log } from '../../log-bus';
import { armOverrideFiredEvents, disarmOverrideFiredEvents } from '../override-fired';
import { checkIdByStandardName } from './check-names';

type ReportingSession = { reportCheck(locationName: string): void };
type FiredLocationListener = (locationName: string) => void;

const locationByFireId = new Map<number, string>();
const armedCheckIds = new Set<string>();
const fired = new Set<number>();
const firedLocationNames = new Set<string>();
const firedListeners = new Set<FiredLocationListener>();
let nextFireId = 0;

/** Allocate the completion id for one armed entry. */
const allocateFireId = (locationName: string): number => {
  const fireId = nextFireId;
  nextFireId += 1;
  locationByFireId.set(fireId, locationName);
  const checkId = checkIdByStandardName(locationName);
  if (checkId !== undefined) armedCheckIds.add(checkId);
  return fireId;
};

/**
 * Whether the active session physically armed this check (npc/drop/standing
 * substitution). While true, its completion must be read from the real
 * substitution facts, never a possession-proxy detection.
 */
const isCheckPhysicallyArmed = (checkId: string): boolean => armedCheckIds.has(checkId);

/** Route substitution reports to the session, one report per entry. */
const armFireReporting = (session: ReportingSession): void => {
  armOverrideFiredEvents((fireId) => {
    const locationName = locationByFireId.get(fireId);
    if (locationName === undefined || fired.has(fireId)) return;
    fired.add(fireId);
    firedLocationNames.add(locationName);
    log.randomizer(`[Override] Substitution fired: ${locationName}`);
    session.reportCheck(locationName);
    for (const listener of firedListeners) listener(locationName);
  });
};

/**
 * The locations whose substitution fired this session. A shelf slot and a
 * pond prize past the reference's two have no check record, so the tracker's
 * completed set never lists them; anything that counts completed locations
 * (the receipt lines' found/total numbers) reads these alongside it.
 */
const firedLocations = (): ReadonlySet<string> => firedLocationNames;

/** Follow substitution reports as they land; returns the unsubscribe. */
const onFiredLocation = (listener: FiredLocationListener): () => void => {
  firedListeners.add(listener);
  return () => firedListeners.delete(listener);
};

const disarmFireReporting = (): void => {
  disarmOverrideFiredEvents();
  locationByFireId.clear();
  armedCheckIds.clear();
  fired.clear();
  firedLocationNames.clear();
  nextFireId = 0;
};

export {
  allocateFireId, armFireReporting, disarmFireReporting, firedLocations, isCheckPhysicallyArmed, onFiredLocation,
};
