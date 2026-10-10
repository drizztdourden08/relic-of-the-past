/* @layer shared-game @kind logic */
import type { DatasetSuggestion } from '../types';
import { find, toScreenIdOf, DOOR_BARRIER } from '@rotp/game-data';
import type { ConnectionRecord } from '@rotp/game-data';
import type { RecorderState, ObservedDoorGate } from './recorder';
import type { UpdateDeps } from './dataset-updates.type';

const connectionKey = (from: string, to: string): string => `${from}|${to}`;

const knownConnectionSet = (connections: ConnectionRecord[]): Set<string> => {
  const set = new Set<string>();
  for (const c of connections) {
    if (c.canExit) set.add(connectionKey(c.screenId, toScreenIdOf(c)));
  }
  return set;
};

const transitionSuggestions = (rec: RecorderState, connections: ConnectionRecord[]): DatasetSuggestion[] => {
  const known = knownConnectionSet(connections);
  return rec.transitions
    .filter(t => !known.has(connectionKey(t.from, t.to)))
    .map(t => ({
      kind: 'connection',
      targetFile: 'connections',
      targetId: null,
      code: `{ screenId: '${t.from}', kind: 'edge', tags: ['transit:walk'] } -> '${t.to}' (canExit: true, needs a paired point)`,
      reason: `Crossing ${t.from} to ${t.to}: traversed, not in dataset.`,
    }));
};

const doorSuggestions = (gates: ObservedDoorGate[]): DatasetSuggestion[] =>
  gates
    .filter(g => !g.opened && DOOR_BARRIER[g.kind])
    .map(g => ({
      kind: 'connection',
      targetFile: 'connections',
      targetId: null,
      code: `// room 0x${g.roomId.toString(16)} ${g.direction} door -> add tag '${DOOR_BARRIER[g.kind]}'`,
      reason: `Door 0x${g.roomId.toString(16)} ${g.direction}: ${g.kind} in game, no barrier tag.`,
    }));

const checkSuggestions = (rec: RecorderState): DatasetSuggestion[] =>
  rec.checks
    .filter(c => c.checkId === null)
    .map(c => ({
      kind: 'check',
      targetFile: 'checks',
      targetId: null,
      code: `// discovered check on screen '${c.screenId}' (room 0x${c.roomId.toString(16)}) at r${c.tile.row} c${c.tile.col}`,
      reason: `Check on ${c.screenId} r${c.tile.row} c${c.tile.col}: in game, not in dataset.`,
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
export type { UpdateDeps } from './dataset-updates.type';
