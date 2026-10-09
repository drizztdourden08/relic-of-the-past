/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { SimObservation, FlagSnapshot, SimTarget } from '@rotp/navigation';
import { emptySnapshot, chestKey, BOMBABLE_ATTR_MIN, updateDungeonLedger } from '@rotp/navigation';
import { dungeonGroupOf, dungeonGroupForScreen } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import { CASTLE_SCREEN, SEWERS_PALACE, SEWERS_ROOM, SEWERS_SCREEN } from './dungeon-ledger.constants';
import { freshState } from './fresh-state';
import { makeChest } from './make-chest';

const baseObs = (flags: FlagSnapshot = emptySnapshot()): SimObservation => ({
  virtual: { screenId: SEWERS_SCREEN, tile: { row: 0, col: 0 } },
  realLocation: { isIndoors: true, roomId: SEWERS_ROOM, owScreenIndex: 0 },
  inventory: new Set(),
  flags,
  interactables: { chests: [], sprites: [], doors: [] },
});

const bombableGrid = (): number[][] => [[0, 0], [0, BOMBABLE_ATTR_MIN]];

const fakeTarget = (key: string, roomId: number): SimTarget => ({
  screenId: SEWERS_SCREEN, roomId, key, label: key, noun: 'chest', verb: 'Opening',
  action: { type: 'chest', roomId, chestIndex: 0, itemId: 0 },
});

describeDataset('dungeon group derivation', () => {
  it('folds the sewers (palace 0) into the castle above it (palace 1)', () => {
    expect(dungeonGroupOf(0x00)).toBe(dungeonGroupOf(0x02));
  });

  it('leaves every other dungeon on its own index', () => {
    expect(dungeonGroupOf(0x04)).not.toBe(dungeonGroupOf(0x02));
    expect(dungeonGroupOf(0x0a)).not.toBe(dungeonGroupOf(0x0c));
  });

  it('resolves real screens to the same group, and a non-dungeon id to null', () => {
    expect(dungeonGroupForScreen(SEWERS_SCREEN)).toBe(dungeonGroupForScreen(CASTLE_SCREEN));
    expect(dungeonGroupForScreen('not-a-real-screen')).toBeNull();
  });
});

describeDataset('updateDungeonLedger accumulates what is owed', () => {
  it('records an unopened chest as owed, blocked by bombs when a bombable wall stands and none are held', () => {
    const state = freshState();
    const obs = baseObs();
    obs.interactables = { chests: [makeChest(0)], sprites: [], doors: [] };
    obs.grids = { screenIndex: SEWERS_ROOM, indoors: true, rawAttrGrid: bombableGrid() };

    updateDungeonLedger(state, obs, []);

    const ledger = state.ledgers.get(dungeonGroupOf(SEWERS_PALACE))!;
    expect(ledger.owed).toHaveLength(1);
    expect(ledger.owed[0]).toMatchObject({ checkId: chestKey(makeChest(0)), roomId: SEWERS_ROOM, blockedBy: 'bombs' });
  });

  it('clears the blocker once the chest is a reachable target (bombs in hand)', () => {
    const state = freshState();
    state.reachTokens.add('bombs');
    const obs = baseObs();
    const chest = makeChest(0);
    obs.interactables = { chests: [chest], sprites: [], doors: [] };
    const key = chestKey(chest);

    updateDungeonLedger(state, obs, [fakeTarget(key, SEWERS_ROOM)]);

    const ledger = state.ledgers.get(dungeonGroupOf(SEWERS_PALACE))!;
    expect(ledger.owed).toEqual([{ checkId: key, roomId: SEWERS_ROOM, blockedBy: undefined }]);
  });

  it('strikes the chest off once it reads opened', () => {
    const state = freshState();
    const obs = baseObs();
    obs.interactables = { chests: [makeChest(0)], sprites: [], doors: [] };
    updateDungeonLedger(state, obs, []);
    expect(state.ledgers.get(dungeonGroupOf(SEWERS_PALACE))!.owed).toHaveLength(1);

    const openedObs = baseObs();
    openedObs.interactables = { chests: [makeChest(0, true)], sprites: [], doors: [] };
    updateDungeonLedger(state, openedObs, []);
    expect(state.ledgers.get(dungeonGroupOf(SEWERS_PALACE))!.owed).toHaveLength(0);
  });
});
