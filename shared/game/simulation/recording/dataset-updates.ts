/* @layer shared-game @kind logic */
/**
 * Turns recorder output into DatasetSuggestion[] — ready-to-write code blocks
 * for the widget's Apply button. Suggestions arise where what the run observed
 * disagrees with or extends the static screen/connection/check data.
 */
import type { DatasetSuggestion } from '../types';
import { find } from '../../data';
import { toScreenIdOf } from '../../data/connections/derive';
import type { ConnectionRecord } from '../../data';
import type { RecorderState, ObservedDoorGate } from './recorder';
import { DOOR_BARRIER } from '../../data/native-tables';

interface UpdateDeps {
  connections?: ConnectionRecord[];
}

const connectionKey = (from: string, to: string): string => `${from}|${to}`;

/** Every crossing the dataset already covers, in the direction it can actually be walked. */
const knownConnectionSet = (connections: ConnectionRecord[]): Set<string> => {
  const set = new Set<string>();
  for (const c of connections) {
    if (c.canExit) set.add(connectionKey(c.screenId, toScreenIdOf(c)));
  }
  return set;
};

const transitionSuggestions = (rec: RecorderState, connections: ConnectionRecord[]): DatasetSuggestion[] => {
  const known = knownConnectionSet(connections);
  // TODO(Phase 7): `code` still emits an informal shorthand, not a real
  // point-pair literal (a connection point now always needs a minted
  // `toConnectionId` partner, which this suggestion cannot allocate); once
  // connections live in the vault as JSON this needs to emit a JSON fragment
  // targeting the vault instead of a TS source snippet.
  return rec.transitions
    .filter(t => !known.has(connectionKey(t.from, t.to)))
    .map(t => ({
      kind: 'connection',
      targetFile: 'connections',
      targetId: null,
      code: `{ screenId: '${t.from}', kind: 'edge', tags: ['transit:walk'] } -> '${t.to}' (canExit: true, needs a paired point)`,
      reason: `Traversed ${t.from} → ${t.to} but no connection exists in the data.`,
    }));
};

const doorSuggestions = (gates: ObservedDoorGate[]): DatasetSuggestion[] =>
  gates
    .filter(g => !g.opened && DOOR_BARRIER[g.kind])
    .map(g => ({
      kind: 'connection',
      targetFile: 'connections',
      targetId: null,
      code: `// room 0x${g.roomId.toString(16)} ${g.direction} door → add tag '${DOOR_BARRIER[g.kind]}'`,
      reason: `Observed a ${g.kind} door on room 0x${g.roomId.toString(16)} (${g.direction}) not reflected in connection barriers.`,
    }));

/**
 * Every observation the matcher could not account for. "Is this check known" is
 * answered by identity: a null checkId IS the unmatched case. It used to compare
 * the observation's name against the set of every check name, which suppressed
 * real suggestions whenever an unknown thing happened to share a name with some
 * other dungeon's check.
 */
const checkSuggestions = (rec: RecorderState): DatasetSuggestion[] =>
  rec.checks
    .filter(c => c.checkId === null)
    .map(c => ({
      kind: 'check',
      targetFile: 'checks',
      targetId: null,
      code: `// discovered check on screen '${c.screenId}' (room 0x${c.roomId.toString(16)}) at r${c.tile.row} c${c.tile.col}`,
      reason: `In-game interactable observed on '${c.screenId}' (room 0x${c.roomId.toString(16)}) with no matching check definition.`,
    }));

const buildDatasetSuggestions = (rec: RecorderState, deps: UpdateDeps = {}): DatasetSuggestion[] => {
  const connections = deps.connections ?? find('connection', () => true);
  return [
    ...transitionSuggestions(rec, connections),
    ...doorSuggestions(rec.doorGates),
    ...checkSuggestions(rec),
  ];
};

export { buildDatasetSuggestions };
export type { UpdateDeps };
