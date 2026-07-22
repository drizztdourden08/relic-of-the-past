/* @layer shared-game @kind logic */
/**
 * Accumulates what a run observed in-game — check positions discovered,
 * screen transitions traversed, and door gates seen — so dataset-updates can
 * turn disagreements with the static data into suggestions.
 */
import type { GridPos } from '../../navigation/types';
import type { SimDoor } from '../types';

interface ObservedCheck {
  name: string;
  screenId: string;
  roomId: number;
  tile: GridPos;
}

interface ObservedTransition {
  from: string;
  to: string;
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
 * Dedupe by name + location, not name alone: unmatched checks all share the
 * generic 'unknown-check' name (see check-matcher's UNKNOWN), so a name-only
 * key would collapse every distinct unknown observation in a run into one.
 */
const recordCheck = (rec: RecorderState, check: ObservedCheck): void => {
  if (!rec.checks.some(c => c.name === check.name && c.roomId === check.roomId && c.screenId === check.screenId)) {
    rec.checks.push(check);
  }
};

const recordTransition = (rec: RecorderState, from: string, to: string): void => {
  if (!rec.transitions.some(t => t.from === from && t.to === to)) rec.transitions.push({ from, to });
};

const recordDoorGate = (rec: RecorderState, door: SimDoor): void => {
  if (!rec.doorGates.some(d => d.roomId === door.roomId && d.direction === door.direction)) {
    rec.doorGates.push({ roomId: door.roomId, kind: door.kind, direction: door.direction, opened: door.opened });
  }
};

export { createRecorder, recordCheck, recordTransition, recordDoorGate };
export type { RecorderState, ObservedCheck, ObservedTransition, ObservedDoorGate };
