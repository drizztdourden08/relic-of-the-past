/* @layer shared-game @kind logic */
/**
 * Turns recorder output into DatasetSuggestion[] — ready-to-write code blocks
 * for the widget's Apply button. Suggestions arise where what the run observed
 * disagrees with or extends the static screen/connection/check data.
 */
import type { ScreenConnection, CheckDefinition } from '../../types';
import type { SimDoor, DatasetSuggestion } from '../types';
import { ALL_CONNECTIONS } from '../../data/connections';
import { ALL_CHECKS } from '../../checks';
import type { RecorderState, ObservedDoorGate } from './recorder';

interface UpdateDeps {
  connections?: ScreenConnection[];
  checks?: CheckDefinition[];
}

const DOOR_BARRIER: Record<SimDoor['kind'], string | null> = {
  normal: null,
  'small-key': 'barrier:small-key',
  'big-key': 'barrier:big-key',
  bombable: 'barrier:bomb',
  shutter: 'barrier:event',
  switch: 'barrier:event',
  trap: null,
};

const connectionKey = (from: string, to: string): string => `${from}|${to}`;

const knownConnectionSet = (connections: ScreenConnection[]): Set<string> => {
  const set = new Set<string>();
  for (const c of connections) {
    set.add(connectionKey(c.from, c.to));
    if (c.tags.includes('dir:two-way')) set.add(connectionKey(c.to, c.from));
  }
  return set;
};

const transitionSuggestions = (rec: RecorderState, connections: ScreenConnection[]): DatasetSuggestion[] => {
  const known = knownConnectionSet(connections);
  return rec.transitions
    .filter(t => !known.has(connectionKey(t.from, t.to)))
    .map(t => ({
      kind: 'connection',
      targetFile: 'connections',
      targetId: null,
      code: `{ from: '${t.from}', to: '${t.to}', tags: ['transit:walk', 'dir:two-way'] },`,
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

const checkSuggestions = (rec: RecorderState, checks: CheckDefinition[]): DatasetSuggestion[] => {
  const known = new Set(checks.map(c => c.name));
  return rec.checks
    .filter(c => !known.has(c.name))
    .map(c => ({
      kind: 'check',
      targetFile: 'checks',
      targetId: null,
      code: `// discovered check on screen '${c.screenId}' (room 0x${c.roomId.toString(16)}) at r${c.tile.row} c${c.tile.col}`,
      reason: `In-game interactable "${c.name}" observed with no matching check definition.`,
    }));
};

const buildDatasetSuggestions = (rec: RecorderState, deps: UpdateDeps = {}): DatasetSuggestion[] => {
  const connections = deps.connections ?? ALL_CONNECTIONS;
  const checks = deps.checks ?? ALL_CHECKS;
  return [
    ...transitionSuggestions(rec, connections),
    ...doorSuggestions(rec.doorGates),
    ...checkSuggestions(rec, checks),
  ];
};

export { buildDatasetSuggestions };
export type { UpdateDeps };
