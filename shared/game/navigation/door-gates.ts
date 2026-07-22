/* @layer shared-game @kind logic */
/**
 * Door records → BFS-gated cells + requirements.
 *
 * A dungeon door that is closed and gated (locked, bombable, switch-operated)
 * becomes a cluster of gated cells. The flood fill may still cross them, but
 * crossing stamps the door's requirement tokens onto the reached path — exactly
 * like an item-gated obstacle. Opened, normal, shutter, and trap doors produce
 * no gate (see doorRequirement).
 */
import type { GridPos } from './types';
import { GRID_SIZE } from './types';
import type { RequirementSet } from './nav-data.types';

/** Door kinds as reported by WasmGetRoomDoorInfo. */
const DOOR_KIND = {
  normal: 0,
  smallKey: 1,
  bigKey: 2,
  bombable: 3,
  shutter: 4,
  switch: 5,
  trap: 6,
} as const;

/** Structural mirror of the bridge's SimDoorRaw so navigation stays a leaf. */
interface DoorGateInput {
  direction: 'north' | 'south' | 'west' | 'east';
  col: number;
  row: number;
  kind: number;
  nativeType: number;
  isOpen: boolean;
}

interface DoorGate {
  cells: GridPos[];
  requirements: RequirementSet;
}

const doorRequirement = (door: DoorGateInput, dungeonSlug: string, roomId: number): RequirementSet => {
  if (door.isOpen) return [];
  switch (door.kind) {
    case DOOR_KIND.smallKey: return [[`smallkey:${dungeonSlug}`]];
    case DOOR_KIND.bigKey: return [[`bigkey:${dungeonSlug}`]];
    case DOOR_KIND.bombable: return [['bombs']];
    case DOOR_KIND.switch: return [[`event:switch-${roomId}`]];
    // Normal doors gate nothing. Shutter doors open when the room is cleared (a
    // kill-gate that combat, which we do not simulate, satisfies) and trap doors
    // are transient — all three are treated as freely passable in v1.
    default: return [];
  }
};

const expandDoorCells = (door: DoorGateInput): GridPos[] => {
  // A door opening is 2 tiles wide and Link's body is 2×2, so cover the door
  // tile, its perpendicular neighbor, and one tile of depth — the 2×2 span the
  // body crosses. Both N/S and E/W doors resolve to the same 2×2 block anchored
  // at (row, col); this stops a 2×2 body from slipping past on one side.
  const cells: GridPos[] = [];
  for (let dr = 0; dr <= 1; dr++) {
    for (let dc = 0; dc <= 1; dc++) {
      const row = door.row + dr;
      const col = door.col + dc;
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) cells.push({ row, col });
    }
  }
  return cells;
};

const buildDoorGates = (doors: DoorGateInput[], dungeonSlug: string, roomId: number): DoorGate[] => {
  const gates: DoorGate[] = [];
  for (const door of doors) {
    const requirements = doorRequirement(door, dungeonSlug, roomId);
    if (requirements.length === 0) continue;
    gates.push({ cells: expandDoorCells(door), requirements });
  }
  return gates;
};

const toGateTokenMap = (gates: DoorGate[]): Map<string, string[]> => {
  // Flatten each gate's OR-of-AND requirement to a flat token list. v1 door
  // requirements are always a single AND-clause, so flatten equals that clause;
  // the flat token set mirrors how obstacle/water reqs accumulate in the BFS.
  const map = new Map<string, string[]>();
  for (const gate of gates) {
    const tokens = gate.requirements.flat();
    if (tokens.length === 0) continue;
    for (const { row, col } of gate.cells) {
      const key = `${row},${col}`;
      const existing = map.get(key);
      if (existing) {
        for (const token of tokens) if (!existing.includes(token)) existing.push(token);
      } else {
        map.set(key, [...tokens]);
      }
    }
  }
  return map;
};

export { doorRequirement, buildDoorGates, toGateTokenMap, DOOR_KIND };
export type { DoorGateInput, DoorGate };
