/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { PresenceCondition, PresenceGameState } from '../../shared/game/simulation/presence/state';
import { evaluatePresence, BOSS_DEAD_BIT } from '../../shared/game/simulation/presence/evaluate';
import type { ItemId } from '../../shared/game/data';

const baseState = (partial: Partial<PresenceGameState> = {}): PresenceGameState => ({
  progressFlags: 0,
  progressIndicator: 0,
  progressIndicator3: 0,
  followerIndicator: 0,
  inventory: new Set<ItemId>(),
  owEventInfo: [],
  roomState: [],
  ...partial,
});

describe('evaluatePresence', () => {
  it('treats an absent condition as always present', () => {
    expect(evaluatePresence(undefined, baseState())).toBe(true);
  });

  it('progressFlag clear/set — masked bit of sram_progress_flags', () => {
    const cond: PresenceCondition = { progressFlag: 0x10, state: 'clear' };
    expect(evaluatePresence(cond, baseState({ progressFlags: 0x00 }))).toBe(true);
    expect(evaluatePresence(cond, baseState({ progressFlags: 0x10 }))).toBe(false);
    // The masked bit set among others — still counts as set.
    expect(evaluatePresence(cond, baseState({ progressFlags: 0x1f }))).toBe(false);
    expect(evaluatePresence({ progressFlag: 0x10, state: 'set' }, baseState({ progressFlags: 0x10 }))).toBe(true);
  });

  it('progressIndicator3 clear/set', () => {
    const cond: PresenceCondition = { progressIndicator3: 0x20, state: 'clear' };
    expect(evaluatePresence(cond, baseState({ progressIndicator3: 0x00 }))).toBe(true);
    expect(evaluatePresence(cond, baseState({ progressIndicator3: 0x20 }))).toBe(false);
    expect(evaluatePresence({ progressIndicator3: 0x10, state: 'set' }, baseState({ progressIndicator3: 0x10 }))).toBe(true);
  });

  it('item owned/not — asked of the inventory by id', () => {
    const cond: PresenceCondition = { itemId: 'item-031', owned: false };
    expect(evaluatePresence(cond, baseState())).toBe(true);
    expect(evaluatePresence(cond, baseState({ inventory: new Set<ItemId>(['item-031']) }))).toBe(false);
    expect(evaluatePresence({ itemId: 'item-031', owned: true }, baseState({ inventory: new Set<ItemId>(['item-031']) }))).toBe(true);
  });

  it('follower none / followerEq', () => {
    expect(evaluatePresence({ follower: 'none' }, baseState({ followerIndicator: 0 }))).toBe(true);
    expect(evaluatePresence({ follower: 'none' }, baseState({ followerIndicator: 7 }))).toBe(false);
    expect(evaluatePresence({ followerEq: 9 }, baseState({ followerIndicator: 9 }))).toBe(true);
    expect(evaluatePresence({ followerEq: 9 }, baseState({ followerIndicator: 0 }))).toBe(false);
  });

  it('owEvent bit clear/set', () => {
    const cond: PresenceCondition = { owEvent: { screen: 0x2f, mask: 0x20 }, state: 'set' };
    expect(evaluatePresence(cond, baseState({ owEventInfo: { 0x2f: 0x20 } as unknown as ArrayLike<number> }))).toBe(true);
    expect(evaluatePresence(cond, baseState({ owEventInfo: [] }))).toBe(false);
  });

  it('roomBossDead reads the 0x8000 save_dung_info bit', () => {
    const room = 0x0a3;
    const dead: PresenceCondition = { roomBossDead: room, dead: true };
    const roomState = { [room]: BOSS_DEAD_BIT } as unknown as ArrayLike<number>;
    expect(evaluatePresence(dead, baseState({ roomState }))).toBe(true);
    expect(evaluatePresence(dead, baseState({ roomState: [] }))).toBe(false);
    expect(evaluatePresence({ roomBossDead: room, dead: false }, baseState({ roomState: [] }))).toBe(true);
  });

  it('and requires every sub-condition — Old Man (no follower AND no mirror)', () => {
    const cond: PresenceCondition = { and: [{ follower: 'none' }, { itemId: 'item-027', owned: false }] };
    expect(evaluatePresence(cond, baseState())).toBe(true);
    expect(evaluatePresence(cond, baseState({ followerIndicator: 1 }))).toBe(false);
    expect(evaluatePresence(cond, baseState({ inventory: new Set<ItemId>(['item-027']) }))).toBe(false);
  });

  it('or requires any sub-condition', () => {
    const cond: PresenceCondition = { or: [{ follower: 'none' }, { itemId: 'item-019', owned: true }] };
    expect(evaluatePresence(cond, baseState({ followerIndicator: 3 }))).toBe(false);
    expect(evaluatePresence(cond, baseState({ followerIndicator: 3, inventory: new Set<ItemId>(['item-019']) }))).toBe(true);
  });

  it('not inverts — Locksmith absent while escorting follower 9', () => {
    const cond: PresenceCondition = { and: [{ not: { followerEq: 9 } }, { progressIndicator3: 0x10, state: 'clear' }] };
    expect(evaluatePresence(cond, baseState())).toBe(true);
    expect(evaluatePresence(cond, baseState({ followerIndicator: 9 }))).toBe(false);
    expect(evaluatePresence(cond, baseState({ progressIndicator3: 0x10 }))).toBe(false);
  });
});
