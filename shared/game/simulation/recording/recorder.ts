/* @layer shared-game @kind logic */
/**
 * Accumulates what a run observed in-game — check positions discovered,
 * screen transitions traversed, and door gates seen — so dataset-updates can
 * turn disagreements with the static data into suggestions.
 */
import type { GridPos } from '../../navigation/types';
import type { CheckId } from '../../data';
import type { SimDoor } from '../types';
import type { TraversalId } from '../traversal-id';

interface ObservedCheck {
  /** Which check this was, or null when the diff matched none — an unmatched
   *  observation is exactly what becomes a dataset suggestion. */
  checkId: CheckId | null;
  screenId: TraversalId;
  roomId: number;
  tile: GridPos;
}

interface ObservedTransition {
  from: TraversalId;
  to: TraversalId;
}

interface ObservedDoorGate {
  roomId: number;
  kind: SimDoor['kind'];
  direction: SimDoor['direction'];
  opened: boolean;
}

interface RecorderState {
  checks: ObservedCheck[];
  transitions: ObservedTransition[];
  doorGates: ObservedDoorGate[];
}

const createRecorder = (): RecorderState => ({ checks: [], transitions: [], doorGates: [] });

/**
 * Dedupe by identity + location, not identity alone: every unmatched observation
 * has a null checkId, so an identity-only key would collapse all of them in a run
 * into one — and they are the ones worth reporting individually.
 */
const recordCheck = (rec: RecorderState, check: ObservedCheck): void => {
  if (!rec.checks.some(c => c.checkId === check.checkId && c.roomId === check.roomId && c.screenId === check.screenId)) {
    rec.checks.push(check);
  }
};

const recordTransition = (rec: RecorderState, from: TraversalId, to: TraversalId): void => {
  if (!rec.transitions.some(t => t.from === from && t.to === to)) rec.transitions.push({ from, to });
};

const recordDoorGate = (rec: RecorderState, door: SimDoor): void => {
  if (!rec.doorGates.some(d => d.roomId === door.roomId && d.direction === door.direction)) {
    rec.doorGates.push({ roomId: door.roomId, kind: door.kind, direction: door.direction, opened: door.opened });
  }
};

export { createRecorder, recordCheck, recordTransition, recordDoorGate };
export type { RecorderState, ObservedCheck, ObservedTransition, ObservedDoorGate };
