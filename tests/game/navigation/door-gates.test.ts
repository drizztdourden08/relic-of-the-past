/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { doorRequirement, buildDoorGates, DOOR_KIND } from '../../../shared/game/navigation/door-gates';
import type { DoorGateInput } from '../../../shared/game/navigation/door-gates';
import { floodFillScreen } from '../../../shared/game/navigation/flood-fill';
import type { FloodFillOptions } from '../../../shared/game/navigation/flood-fill';
import { GRID_SIZE } from '../../../shared/game/navigation/types';

const makeDoor = (over: Partial<DoorGateInput>): DoorGateInput => ({
  direction: 'east', col: 20, row: 10, kind: DOOR_KIND.normal, nativeType: 0, isOpen: false, ...over,
});

describe('doorRequirement — door kind → requirement mapping', () => {
  it('opened doors gate nothing regardless of kind', () => {
    for (const kind of Object.values(DOOR_KIND)) {
      expect(doorRequirement(makeDoor({ kind, isOpen: true }), 'hyrule-castle', 7)).toEqual([]);
    }
  });

  it('small-key doors require a dungeon small key', () => {
    expect(doorRequirement(makeDoor({ kind: DOOR_KIND.smallKey }), 'hyrule-castle', 7))
      .toEqual([['smallkey:hyrule-castle']]);
  });

  it('big-key doors require the dungeon big key', () => {
    expect(doorRequirement(makeDoor({ kind: DOOR_KIND.bigKey }), 'eastern-palace', 7))
      .toEqual([['bigkey:eastern-palace']]);
  });

  it('bombable doors require bombs', () => {
    expect(doorRequirement(makeDoor({ kind: DOOR_KIND.bombable }), 'hyrule-castle', 7))
      .toEqual([['bombs']]);
  });

  it('switch doors require a room-scoped switch event', () => {
    expect(doorRequirement(makeDoor({ kind: DOOR_KIND.switch }), 'hyrule-castle', 42))
      .toEqual([['event:switch-42']]);
  });

  it('normal, shutter and trap doors are passable in v1 (no gate)', () => {
    expect(doorRequirement(makeDoor({ kind: DOOR_KIND.normal }), 'hyrule-castle', 7)).toEqual([]);
    expect(doorRequirement(makeDoor({ kind: DOOR_KIND.shutter }), 'hyrule-castle', 7)).toEqual([]);
    expect(doorRequirement(makeDoor({ kind: DOOR_KIND.trap }), 'hyrule-castle', 7)).toEqual([]);
  });
});

describe('buildDoorGates — cell expansion + gate filtering', () => {
  it('expands a closed gated door into its 2×2 body-crossing span', () => {
    const gates = buildDoorGates([makeDoor({ kind: DOOR_KIND.smallKey, row: 10, col: 20 })], 'hyrule-castle', 7);
    expect(gates).toHaveLength(1);
    expect(gates[0].requirements).toEqual([['smallkey:hyrule-castle']]);
    expect(gates[0].cells).toEqual([
      { row: 10, col: 20 }, { row: 10, col: 21 },
      { row: 11, col: 20 }, { row: 11, col: 21 },
    ]);
  });

  it('clamps the 2×2 span to the grid edge', () => {
    const gates = buildDoorGates(
      [makeDoor({ kind: DOOR_KIND.bombable, row: GRID_SIZE - 1, col: GRID_SIZE - 1 })], 'hyrule-castle', 7,
    );
    expect(gates[0].cells).toEqual([{ row: GRID_SIZE - 1, col: GRID_SIZE - 1 }]);
  });

  it('omits opened and ungated doors — only real gates survive', () => {
    const gates = buildDoorGates([
      makeDoor({ kind: DOOR_KIND.smallKey, isOpen: true }),   // opened → no gate
      makeDoor({ kind: DOOR_KIND.normal }),                    // ungated → no gate
      makeDoor({ kind: DOOR_KIND.shutter }),                   // clear-gated, passable v1 → no gate
      makeDoor({ kind: DOOR_KIND.bigKey, row: 5, col: 5 }),    // real gate
    ], 'hyrule-castle', 7);
    expect(gates).toHaveLength(1);
    expect(gates[0].requirements).toEqual([['bigkey:hyrule-castle']]);
  });
});

// Synthetic overworld screen: a full-height wall at col 32 splits region A (cols 0–31)
// from region B (cols 33–63), joined only by a 2-tile-tall opening at rows 30–31. Flood
// starts in region A; every path into region B must cross the opening.
const walledScreen = (): number[][] => {
  const grid = Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0x00));
  for (let r = 0; r < GRID_SIZE; r++) grid[r][32] = 0x01; // wall
  grid[30][32] = 0x00; // opening
  grid[31][32] = 0x00;
  return grid;
};

const BASE_OPTIONS: FloodFillOptions = { tileContext: 'overworld', startPos: { row: 31, col: 10 } };

describe('flood-fill door-gate integration', () => {
  const grid = walledScreen();
  const gates = buildDoorGates(
    [makeDoor({ direction: 'east', kind: DOOR_KIND.smallKey, row: 30, col: 32 })], 'test-dungeon', 42,
  );

  const noGates = floodFillScreen(grid, 0, BASE_OPTIONS);
  const withGates = floodFillScreen(grid, 0, { ...BASE_OPTIONS, doorGates: gates });

  it('reaches region B in both runs', () => {
    expect(noGates.reachable[30][50]).not.toBe(0);
    expect(withGates.reachable[30][50]).not.toBe(0);
  });

  it('without gates, region B is reached requirement-free', () => {
    expect(noGates.reqGrid![30][50]).toBe('');
    expect(noGates.reqGrid![31][60]).toBe('');
  });

  it('with gates, region B tiles carry the small-key requirement', () => {
    expect(withGates.reqGrid![30][50]).toBe('smallkey:test-dungeon');
    expect(withGates.reqGrid![31][60]).toBe('smallkey:test-dungeon');
  });

  it('with gates, region A (reached before the door) stays requirement-free', () => {
    expect(withGates.reqGrid![31][10]).toBe('');
  });

  it('an empty doorGates run is byte-identical to a no-gates run', () => {
    const emptyGates = floodFillScreen(grid, 0, { ...BASE_OPTIONS, doorGates: [] });
    expect(emptyGates).toEqual(noGates);
  });
});
