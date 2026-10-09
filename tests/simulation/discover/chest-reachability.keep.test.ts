/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { SimChest } from '../../../shared/game/simulation/types';
import { discoverTargets, hasReachableOpenTile } from '../../../shared/game/simulation/engine/discover';
import { emptySnapshot } from '../../../shared/game/simulation/detect/flag-snapshot';
import { describeDataset } from '../../dataset-guard';
import { CHEST_ROOM } from './discover.constants';
import { baseObs } from './base-obs';
import { freshState } from './fresh-state';

const makeChest = (tile: { row: number; col: number }): SimChest => ({
  roomId: CHEST_ROOM,
  chestIndex: 0,
  tile,
  posKnown: true,
  opened: false,
  itemId: 0x12,
});

const floodFrom = (rows: number[][]): boolean[][] => rows.map((r) => r.map(Boolean));

const openBelowLeft = (r: number, c: number): boolean[][] => {
  const rows: number[][] = [];
  for (let row = 0; row <= r + 2; row++) rows.push(new Array(c + 2).fill(0));
  rows[r + 2][c] = 1;
  return floodFrom(rows);
};

const ROW_ABOVE_ANCHOR_ONLY = [
  [0, 1, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

describeDataset('hasReachableOpenTile', () => {
  it('is true when the tile two rows below the anchor (left column) is reachable', () => {
    expect(hasReachableOpenTile(openBelowLeft(0, 0), { row: 0, col: 0 })).toBe(true);
  });

  it('is true when the tile two rows below the anchor (right column) is reachable', () => {
    const flood = floodFrom([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ]);
    expect(hasReachableOpenTile(flood, { row: 0, col: 1 })).toBe(true);
  });

  it('is false when only a wrong-side neighbor (above/beside) is reachable', () => {
    const flood = floodFrom(ROW_ABOVE_ANCHOR_ONLY);
    expect(hasReachableOpenTile(flood, { row: 1, col: 1 })).toBe(false);
  });
});

describeDataset('discoverTargets reads chest reachability off the open-from tile below', () => {
  it('discovers a chest when the tile two rows below its anchor is reachable', () => {
    const flood = openBelowLeft(0, 0);
    const state = freshState();
    const obs = baseObs(emptySnapshot());
    obs.interactables = { chests: [makeChest({ row: 0, col: 0 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, flood);
    expect(targets).toHaveLength(1);
  });

  it('drops a chest when only the tile above it is reachable (wrong side)', () => {
    const flood = floodFrom(ROW_ABOVE_ANCHOR_ONLY);
    const state = freshState();
    const obs = baseObs(emptySnapshot());
    obs.interactables = { chests: [makeChest({ row: 1, col: 1 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, flood);
    expect(targets).toHaveLength(0);
  });

  it('drops a chest fully surrounded by blocked tiles', () => {
    const flood = floodFrom([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    const state = freshState();
    const obs = baseObs(emptySnapshot());
    obs.interactables = { chests: [makeChest({ row: 1, col: 1 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, flood);
    expect(targets).toHaveLength(0);
  });
});
