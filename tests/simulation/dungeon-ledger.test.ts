/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { SimObservation, SimChest, FlagSnapshot, DetectedCheck, SimEvent } from '../../shared/game/simulation/types';
import type { SimTarget } from '../../shared/game/simulation/engine/state';
import { createEngineState } from '../../shared/game/simulation/engine/state';
import { emptySnapshot } from '../../shared/game/simulation/detect/flag-snapshot';
import { chestKey } from '../../shared/game/simulation/engine/discover';
import { BOMBABLE_ATTR_MIN } from '../../shared/game/simulation/engine/discover-bombs';
import { updateDungeonLedger } from '../../shared/game/simulation/engine/dungeon-ledger-scan';
import { closeIdleDungeonGroups, reopenLedgersFor } from '../../shared/game/simulation/engine/dungeon-ledger-lifecycle';
import { onCheckVerified } from '../../shared/game/simulation/engine/explorer';
import { dungeonGroupOf, dungeonGroupForScreen } from '../../shared/game/logic/queries/dungeon-group';

// Real dungeon-group data: the sewers (hc-0x11, palace index 0x00) are reachable
// only through the castle above (hc-0x01, palace index 0x02) — the one case the
// ledger groups together.
// Traversal ids are the game's own room numbers, never a definition's slug —
// the ledger has to resolve a group from the id shape the run actually emits.
const SEWERS_SCREEN = 'room:17';
const CASTLE_SCREEN = 'room:1';
const SEWERS_ROOM = 0x11;

const freshState = (screenId = SEWERS_SCREEN) => createEngineState({ screenId, tile: { row: 0, col: 0 } }, new Set(), {});

const baseObs = (flags: FlagSnapshot = emptySnapshot()): SimObservation => ({
  virtual: { screenId: SEWERS_SCREEN, tile: { row: 0, col: 0 } },
  realLocation: { isIndoors: true, roomId: SEWERS_ROOM, owScreenIndex: 0 },
  inventory: new Set(),
  flags,
  interactables: { chests: [], sprites: [], doors: [] },
});

const makeChest = (chestIndex: number, opened = false): SimChest => ({
  roomId: SEWERS_ROOM, chestIndex, isBig: false, tile: { row: 10, col: 10 }, posKnown: true, opened,
});

const bombableGrid = (): number[][] => [[0, 0], [0, BOMBABLE_ATTR_MIN]];

const fakeTarget = (key: string, roomId: number): SimTarget => ({
  screenId: SEWERS_SCREEN, roomId, key, label: key, noun: 'chest', verb: 'Opening',
  action: { type: 'chest', roomId, chestIndex: 0, itemId: 0 },
});

describe('dungeon group derivation', () => {
  it('folds the sewers (palace 0) into the castle above it (palace 1)', () => {
    expect(dungeonGroupOf(0x00)).toBe(dungeonGroupOf(0x02));
  });

  it('leaves every other dungeon on its own index', () => {
    expect(dungeonGroupOf(0x04)).not.toBe(dungeonGroupOf(0x02)); // Eastern Palace vs the castle
    expect(dungeonGroupOf(0x0a)).not.toBe(dungeonGroupOf(0x0c)); // Swamp Palace vs Palace of Darkness
  });

  it('resolves real screens to the same group, and a non-dungeon id to null', () => {
    expect(dungeonGroupForScreen(SEWERS_SCREEN)).toBe(dungeonGroupForScreen(CASTLE_SCREEN));
    expect(dungeonGroupForScreen('not-a-real-screen')).toBeNull();
  });
});

describe('updateDungeonLedger — owed accumulation', () => {
  it('records an unopened chest as owed, blocked by bombs when a bombable wall stands and none are held', () => {
    const state = freshState();
    const obs = baseObs();
    obs.interactables = { chests: [makeChest(0)], sprites: [], doors: [] };
    obs.grids = { screenIndex: SEWERS_ROOM, tileContext: 'interior-dungeon', rawAttrGrid: bombableGrid() };

    updateDungeonLedger(state, obs, []);

    const ledger = state.ledgers.get(dungeonGroupOf(0x00))!;
    expect(ledger.owed).toHaveLength(1);
    expect(ledger.owed[0]).toMatchObject({ checkId: chestKey(makeChest(0)), roomId: SEWERS_ROOM, blockedBy: 'bombs' });
  });

  it('clears the blocker once the chest is an actionable target (bombs in hand)', () => {
    const state = freshState();
    state.reachTokens.add('bombs');
    const obs = baseObs();
    const chest = makeChest(0);
    obs.interactables = { chests: [chest], sprites: [], doors: [] };
    const key = chestKey(chest);

    updateDungeonLedger(state, obs, [fakeTarget(key, SEWERS_ROOM)]);

    const ledger = state.ledgers.get(dungeonGroupOf(0x00))!;
    expect(ledger.owed).toEqual([{ checkId: key, roomId: SEWERS_ROOM, blockedBy: undefined }]);
  });

  it('strikes the chest off once it reads opened', () => {
    const state = freshState();
    const obs = baseObs();
    obs.interactables = { chests: [makeChest(0)], sprites: [], doors: [] };
    updateDungeonLedger(state, obs, []);
    expect(state.ledgers.get(dungeonGroupOf(0x00))!.owed).toHaveLength(1);

    const openedObs = baseObs();
    openedObs.interactables = { chests: [makeChest(0, true)], sprites: [], doors: [] };
    updateDungeonLedger(state, openedObs, []);
    expect(state.ledgers.get(dungeonGroupOf(0x00))!.owed).toHaveLength(0);
  });
});

describe('closeIdleDungeonGroups', () => {
  it('marks a group complete once its owed list is empty', () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(0x00);
    state.ledgers.set(group, { group, owed: [], exhausted: false, complete: false, reopensOn: [] });

    closeIdleDungeonGroups(state, []);

    const ledger = state.ledgers.get(group)!;
    expect(ledger.complete).toBe(true);
    expect(ledger.exhausted).toBe(false);
  });

  it('marks a group exhausted with reopensOn gathered from its owed blockers', () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(0x00);
    state.ledgers.set(group, {
      group,
      owed: [{ checkId: chestKey(makeChest(0)), roomId: SEWERS_ROOM, blockedBy: 'bombs' }],
      exhausted: false,
      complete: false,
      reopensOn: [],
    });

    const events: SimEvent[] = [];
    closeIdleDungeonGroups(state, events);

    const ledger = state.ledgers.get(group)!;
    expect(ledger.exhausted).toBe(true);
    expect(ledger.complete).toBe(false);
    expect(ledger.reopensOn).toEqual(['bombs']);
  });

  it('leaves a group alone while any of its screens are still in the frontier', () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(0x00);
    state.ledgers.set(group, {
      group,
      owed: [{ checkId: chestKey(makeChest(0)), roomId: SEWERS_ROOM, blockedBy: 'bombs' }],
      exhausted: false,
      complete: false,
      reopensOn: [],
    });
    state.frontier = [SEWERS_SCREEN];

    closeIdleDungeonGroups(state, []);

    expect(state.ledgers.get(group)!.exhausted).toBe(false);
  });
});

describe('reopenLedgersFor', () => {
  const exhaustedState = () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(0x00);
    state.ledgers.set(group, {
      group,
      owed: [{ checkId: chestKey(makeChest(0)), roomId: SEWERS_ROOM, blockedBy: 'bombs' }],
      exhausted: true,
      complete: false,
      reopensOn: ['bombs'],
    });
    state.visited.add(SEWERS_SCREEN);
    state.visited.add(CASTLE_SCREEN);
    return { state, group };
  };

  it('does not reopen on an unrelated acquisition', () => {
    const { state, group } = exhaustedState();
    reopenLedgersFor(state, ['hammer'], 'the hammer', []);
    expect(state.ledgers.get(group)!.exhausted).toBe(true);
    expect(state.visited.has(SEWERS_SCREEN)).toBe(true);
  });

  it('reopens and un-visits the group\'s screens when a listed token is acquired', () => {
    const { state, group } = exhaustedState();
    const events: SimEvent[] = [];
    reopenLedgersFor(state, ['bombs'], 'bombs', events);

    const ledger = state.ledgers.get(group)!;
    expect(ledger.exhausted).toBe(false);
    expect(ledger.reopensOn).toEqual([]);
    expect(state.visited.has(SEWERS_SCREEN)).toBe(false);
    expect(state.visited.has(CASTLE_SCREEN)).toBe(false);
    expect(events).toHaveLength(1);
  });
});

describe('onCheckVerified — reopen hooked into the item-gained path', () => {
  it('reopens an exhausted group when the received item grants a listed token', () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(0x00);
    state.ledgers.set(group, {
      group,
      owed: [{ checkId: chestKey(makeChest(0)), roomId: SEWERS_ROOM, blockedBy: 'bombs' }],
      exhausted: true,
      complete: false,
      reopensOn: ['bombs'],
    });
    state.visited.add(SEWERS_SCREEN);

    // item-041 is the bomb pickup, which is what grants the 'bombs' token.
    const check: DetectedCheck = { evidence: [], itemReceived: 'item-041', at: state.virtual };
    const events: SimEvent[] = [];
    onCheckVerified(state, check, events);

    const ledger = state.ledgers.get(group)!;
    expect(ledger.exhausted).toBe(false);
    expect(state.visited.has(SEWERS_SCREEN)).toBe(false);
  });
});
