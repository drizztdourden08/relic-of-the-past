/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { CheckRecord } from '@rotp/game-data';
import type { SimChest, DetectedCheck } from '@rotp/navigation';
import type { FloodFillResult } from '@rotp/game-core';
import { createEngineState } from '@rotp/navigation';
import { onCheckVerified } from '@rotp/navigation';
import { discoverTargets } from '@rotp/navigation';
import { emptySnapshot } from '@rotp/navigation';
import { describeDataset } from '../../dataset-guard';
import { BIG_KEY, BOMBS_ID, KAKARIKO_TAVERN_ROOM, SMALL_KEY } from './engine-review-fixes.constants';
import { baseObs } from './base-obs';

const freshState = () => createEngineState({ screenId: 'A', tile: { row: 0, col: 0 } }, new Set(), {});

const unreachableFlood = { reachable: [[0]] } as unknown as FloodFillResult;

const makeChest = (posKnown: boolean, tile: { row: number; col: number }): SimChest => ({
  roomId: KAKARIKO_TAVERN_ROOM,
  chestIndex: 0,
  tile,
  posKnown,
  opened: false,
  itemId: BOMBS_ID,
});

describeDataset('discover on unknown-position interactables', () => {
  it('discovers a posKnown=false chest even when its tile is unreachable', () => {
    const state = freshState();
    const obs = baseObs('A', emptySnapshot());
    obs.interactables = { chests: [makeChest(false, { row: 0xff, col: 0xff })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, unreachableFlood);
    expect(targets).toHaveLength(1);
  });

  it('drops a posKnown=true chest whose tile is unreachable', () => {
    const state = freshState();
    const obs = baseObs('A', emptySnapshot());
    obs.interactables = { chests: [makeChest(true, { row: 5, col: 5 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, unreachableFlood);
    expect(targets).toHaveLength(0);
  });

  it('discovers a posKnown=true chest whose tile is outside the 64x64 flood grid', () => {
    const state = freshState();
    const obs = baseObs('A', emptySnapshot());
    obs.interactables = { chests: [makeChest(true, { row: 126, col: 20 })], sprites: [], doors: [] };

    const targets = discoverTargets(state, obs, unreachableFlood);
    expect(targets).toHaveLength(1);
  });
});

describeDataset('explorer attributes a generic key', () => {
  const detected = (opts: Partial<DetectedCheck>): DetectedCheck => ({
    evidence: [],
    at: { screenId: 'A', tile: { row: 0, col: 0 } },
    ...opts,
  });

  it('attributes a suffix-less "Small Key" to the matched check\'s dungeon', () => {
    const s = freshState();
    const matched = { id: 'check-117', dungeonId: 'dungeon-003' } as CheckRecord;
    onCheckVerified(s, detected({ itemReceived: SMALL_KEY, matched, checkId: matched.id }));
    expect(s.keys.get('dungeon-003')).toBe(1);
    expect(s.keys.get('dungeon-009')).toBeUndefined();
  });

  it('attributes a suffix-less "Big Key" to the matched check\'s dungeon', () => {
    const s = freshState();
    const matched = { id: 'check-179', dungeonId: 'dungeon-009' } as CheckRecord;
    onCheckVerified(s, detected({ itemReceived: BIG_KEY, matched, checkId: matched.id }));
    expect(s.bigKeys.has('dungeon-009')).toBe(true);
    expect(s.bigKeys.has('dungeon-003')).toBe(false);
  });
});
