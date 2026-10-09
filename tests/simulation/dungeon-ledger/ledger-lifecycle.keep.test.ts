/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { DetectedCheck, SimEvent } from '../../../shared/game/simulation/types';
import { chestKey } from '../../../shared/game/simulation/engine/discover';
import { closeIdleDungeonGroups, reopenLedgersFor } from '../../../shared/game/simulation/engine/dungeon-ledger-lifecycle';
import { onCheckVerified } from '../../../shared/game/simulation/engine/explorer';
import { dungeonGroupOf } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import { BOMB_PICKUP, CASTLE_SCREEN, SEWERS_PALACE, SEWERS_ROOM, SEWERS_SCREEN } from './dungeon-ledger.constants';
import { freshState } from './fresh-state';
import { makeChest } from './make-chest';

describeDataset('closeIdleDungeonGroups', () => {
  it('marks a group complete once its owed list is empty', () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(SEWERS_PALACE);
    state.ledgers.set(group, { group, owed: [], exhausted: false, complete: false, reopensOn: [] });

    closeIdleDungeonGroups(state, []);

    const ledger = state.ledgers.get(group)!;
    expect(ledger.complete).toBe(true);
    expect(ledger.exhausted).toBe(false);
  });

  it('marks a group exhausted with reopensOn gathered from its owed blockers', () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(SEWERS_PALACE);
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
    const group = dungeonGroupOf(SEWERS_PALACE);
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

describeDataset('reopenLedgersFor', () => {
  const exhaustedState = () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(SEWERS_PALACE);
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

describeDataset('onCheckVerified hooks reopen into the item-gained path', () => {
  it('reopens an exhausted group when the received item grants a listed token', () => {
    const state = freshState('some-other-screen');
    const group = dungeonGroupOf(SEWERS_PALACE);
    state.ledgers.set(group, {
      group,
      owed: [{ checkId: chestKey(makeChest(0)), roomId: SEWERS_ROOM, blockedBy: 'bombs' }],
      exhausted: true,
      complete: false,
      reopensOn: ['bombs'],
    });
    state.visited.add(SEWERS_SCREEN);

    const check: DetectedCheck = { evidence: [], itemReceived: BOMB_PICKUP, at: state.virtual };
    const events: SimEvent[] = [];
    onCheckVerified(state, check, events);

    const ledger = state.ledgers.get(group)!;
    expect(ledger.exhausted).toBe(false);
    expect(state.visited.has(SEWERS_SCREEN)).toBe(false);
  });
});
