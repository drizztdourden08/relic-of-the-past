/* @layer shared-game @kind logic */
/**
 * Capacity-aware readings of the collection state, over the family ladders:
 * the file's starting rung plus every collected item's jump, clamped to the
 * top of the ladder (rung 0 is the empty tier: no capacity, no magic). A
 * vanilla family keeps the reference's fixed-option arithmetic
 * (StateHelpers.py can_use_bombs / can_hold_arrows with the capacity shuffle
 * off: the vanilla rung, plus the whole grid once the shop event is reached);
 * a family in the pool counts its items instead and gets no shop bonus — the
 * reference's own on-mode divergence. A progressive item is one step of
 * the family's plan: k copies collected reach the plan's cumulative rung k,
 * whatever the fill order (the jumps come from the same planOf the pool
 * used). The wallet reading and the meter's empty-rung test feed the price
 * overlay (rules/prices.ts) and the item usability gate (item-usability.ts);
 * the reference has neither.
 */
import { ITEM } from './item-names.data';
import { EXPLOSIVES, METER, PROJECTILES, WALLET } from './capacity/capacity-family';
import { REFERENCE_CAPACITY_PROFILE } from './capacity/capacity-profile-defaults';
import { planOf, startTierOf } from './capacity/family-plan';
import type { CapacityFamily } from './capacity/capacity-family';
import type { FamilySetting } from './capacity/capacity-profile.type';
import type { CollectionState } from './collection-state';

const settingOf = (state: CollectionState, capacityFamily: CapacityFamily): FamilySetting =>
  (state.world.options.capacity ?? REFERENCE_CAPACITY_PROFILE)[capacityFamily.id];

/** The plan's jumps per setting object — the rules ask on every evaluation, the plan never changes. */
const PLAN_JUMPS = new WeakMap<FamilySetting, readonly number[]>();

const planJumpsOf = (capacityFamily: CapacityFamily, setting: FamilySetting): readonly number[] => {
  const cached = PLAN_JUMPS.get(setting);
  if (cached !== undefined) return cached;
  const jumps = setting.mode === 'custom' ? planOf(capacityFamily, setting).jumps : [];
  PLAN_JUMPS.set(setting, jumps);
  return jumps;
};

/** Σ jump × count over every fixed-jump name, plus the first k planned jumps for k progressive copies. */
const collectedStepsOf = (state: CollectionState, capacityFamily: CapacityFamily, setting: FamilySetting): number => {
  let steps = 0;
  for (let jump = 1; jump <= capacityFamily.maxJump; jump += 1) {
    steps += jump * state.count(capacityFamily.itemFor(jump));
  }
  const progressive = state.count(capacityFamily.progressiveItem);
  if (progressive > 0) {
    const jumps = planJumpsOf(capacityFamily, setting);
    for (let k = 0; k < Math.min(progressive, jumps.length); k += 1) steps += jumps[k];
  }
  return steps;
};

/** Ladder rung reached: start rung + collected steps, clamped to the top. */
const tierReached = (state: CollectionState, capacityFamily: CapacityFamily, setting: FamilySetting): number =>
  Math.min(
    capacityFamily.ladder.length - 1,
    startTierOf(capacityFamily, setting) + collectedStepsOf(state, capacityFamily, setting),
  );

const explosivesCapacity = (state: CollectionState): number => {
  const setting = settingOf(state, EXPLOSIVES);
  const { ladder, vanillaRung } = EXPLOSIVES;
  if (setting.mode === 'vanilla') return state.has(ITEM.capacityUpgradeShop) ? ladder[ladder.length - 1] : ladder[vanillaRung];
  return ladder[tierReached(state, EXPLOSIVES, setting)];
};

const projectilesCapacity = (state: CollectionState): number => {
  const setting = settingOf(state, PROJECTILES);
  const { ladder, vanillaRung } = PROJECTILES;
  if (setting.mode === 'vanilla') return state.has(ITEM.capacityUpgradeShop) ? ladder[ladder.length - 1] : ladder[vanillaRung];
  return ladder[tierReached(state, PROJECTILES, setting)];
};

/**
 * How many uses one full meter affords, relative to full cost: 1 · 2 · 4 for
 * the three native levels, 0 on the empty rung (no magic at all); the
 * reference item names outside Custom.
 */
const meterUsesMultiplier = (state: CollectionState): number => {
  const setting = settingOf(state, METER);
  if (setting.mode !== 'custom') {
    if (state.has(ITEM.magicUpgradeQuarter)) return 4;
    return state.has(ITEM.magicUpgradeHalf) ? 2 : 1;
  }
  const rung = tierReached(state, METER, setting);
  return rung === 0 ? 0 : 2 ** (rung - 1);
};

/** No magic at all on the meter's empty rung: every use is refused there. */
const hasMeterCapacity = (state: CollectionState): boolean => meterUsesMultiplier(state) > 0;

/** The largest rupee count the wallet holds at once: the vanilla 999, or the ladder rung reached. */
const walletCapacity = (state: CollectionState): number => {
  const setting = settingOf(state, WALLET);
  const { ladder, vanillaRung } = WALLET;
  if (setting.mode !== 'custom') return ladder[vanillaRung];
  return ladder[tierReached(state, WALLET, setting)];
};

/** The first wallet rung that holds |price| at once. */
const walletRungFor = (price: number): number => {
  const rung = WALLET.ladder.findIndex((value) => value >= price);
  if (rung === -1) throw new Error(`no wallet rung holds ${price}`);
  return rung;
};

export {
  explosivesCapacity, hasMeterCapacity, meterUsesMultiplier, projectilesCapacity, walletCapacity, walletRungFor,
};
