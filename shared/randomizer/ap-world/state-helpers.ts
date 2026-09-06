/* @layer shared-game @kind logic */
/**
 * Equipment/capacity helpers ported from Archipelago worlds/alttp/
 * StateHelpers.py (python has_sword, has_beam_sword, has_melee_weapon,
 * can_lift_rocks, can_lift_heavy_rocks, has_fire_source, can_melt_things,
 * can_shoot_arrows, can_hold_arrows, can_use_bombs, can_bomb_or_bonk,
 * bottle_count, heart_count, has_hearts, can_extend_magic, can_buy,
 * can_buy_unlimited). Baseline options are fixed: normal difficulty and
 * item functionality, bombless start off, swordless off. Retro bow is no
 * longer among them: it is a setting now, read off the world.
 * The capacity readings come from the world's capacity profile
 * (state-helpers-capacity.ts), so the reference's shuffle-on and shuffle-off
 * branches both live there. Shop purchase logic is out of scope.
 */
import { BOTTLE_ITEMS, ITEM, REGION_NAME } from './item-names.data';
import { explosivesCapacity, meterUsesMultiplier, projectilesCapacity } from './state-helpers-capacity';
import { canHoldQuiver } from './retro/retro-logic';
import type { CollectionState } from './collection-state';

/** Normal-difficulty logic limits (python ItemPool difficulties['normal']). */
const BASELINE = {
  progressiveBottleLimit: 4,
  logicalHeartPieces: 24,
  logicalHeartContainers: 10,
  startingHearts: 3,
} as const;

const hasSword = (state: CollectionState): boolean =>
  state.hasAny([ITEM.fighterSword, ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword]);

const hasBeamSword = (state: CollectionState): boolean =>
  state.hasAny([ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword]);

const hasMeleeWeapon = (state: CollectionState): boolean =>
  hasSword(state) || state.has(ITEM.hammer);

const canLiftRocks = (state: CollectionState): boolean =>
  state.has(ITEM.powerGlove) || state.has(ITEM.titansMitts);

const canLiftHeavyRocks = (state: CollectionState): boolean => state.has(ITEM.titansMitts);

const hasFireSource = (state: CollectionState): boolean =>
  state.has(ITEM.fireRod) || state.has(ITEM.lamp);

/** Swordless is off in the baseline, so the medallion path needs a sword. */
const canMeltThings = (state: CollectionState): boolean =>
  state.has(ITEM.fireRod) || (state.has(ITEM.bombos) && hasSword(state));

/**
 * Shop purchases are out of scope for the baseline (no shop pool). The
 * python can_buy/can_buy_unlimited walk the shop objects, so anything that
 * reaches for them here is a porting error until shops are modeled.
 */
const canBuy = (): boolean => {
  throw new Error('shop purchase logic is not ported (shops are out of the pool)');
};

const canBuyUnlimited = (): boolean => {
  throw new Error('shop purchase logic is not ported (shops are out of the pool)');
};

/** python can_hold_arrows: the projectiles capacity the profile and the collected upgrades reach. */
const canHoldArrows = (state: CollectionState, quantity: number): boolean =>
  quantity <= projectilesCapacity(state);

/**
 * python can_shoot_arrows. With retro on there is no ammunition to carry, so
 * the capacity stops being the question and the QUIVER becomes it: held as a
 * placed item where the shops are shuffled, bought off its shelf where they
 * are not (retro/retro-logic.ts). With retro off this is the reading it always
 * had: an arrow capacity on the empty rung holds no arrow to fire.
 */
const canShootArrows = (state: CollectionState, count = 0): boolean => {
  if (!state.has(ITEM.bow) && !state.has(ITEM.silverBow)) return false;
  const retro = state.world.options.retroBow;
  if (retro?.enabled === true) return canHoldQuiver(state, retro);
  return projectilesCapacity(state) > 0 && canHoldArrows(state, count);
};

/** python can_use_bombs (bombless start off): the explosives capacity reached, against the 50 cap. */
const canUseBombs = (state: CollectionState, quantity = 1): boolean =>
  explosivesCapacity(state) >= Math.min(quantity, 50);

const canBombOrBonk = (state: CollectionState): boolean =>
  state.has(ITEM.pegasusBoots) || canUseBombs(state);

const bottleCount = (state: CollectionState): number =>
  Math.min(BASELINE.progressiveBottleLimit, state.countGroup(BOTTLE_ITEMS));

const heartCount = (state: CollectionState): number =>
  Math.min(state.count(ITEM.bossHeartContainer), BASELINE.logicalHeartContainers)
  + state.count(ITEM.sanctuaryHeartContainer)
  + Math.floor(Math.min(state.count(ITEM.pieceOfHeart), BASELINE.logicalHeartPieces) / 4)
  + BASELINE.startingHearts;

const hasHearts = (state: CollectionState, count: number): boolean => heartCount(state) >= count;

/**
 * Total magic meter check (python can_extend_magic, StateHelpers.py 70-84).
 * The purchase branch (77-83): with an unlimited green/blue potion seller
 * reachable, each carried bottle refills the meter, under normal item
 * functionality that multiplies base magic by bottle count regardless of the
 * fullrefill flag (the hard/expert reductions are off-baseline). The only
 * such seller under default shop inventories is the one shop region named in
 * the data table, so can_buy_unlimited reduces to reaching it.
 */
const canExtendMagic = (state: CollectionState, smallmagic = 16): boolean => {
  // 8 at full cost, 16 at half, 32 at quarter, and the meter level doubles it; 0 without magic.
  let basemagic = 8 * meterUsesMultiplier(state);
  if (state.canReachRegion(REGION_NAME.potionSeller)) {
    basemagic += basemagic * bottleCount(state);
  }
  return basemagic >= smallmagic;
};

export {
  BASELINE,
  hasSword,
  hasBeamSword,
  hasMeleeWeapon,
  canLiftRocks,
  canLiftHeavyRocks,
  hasFireSource,
  canMeltThings,
  canBuy,
  canBuyUnlimited,
  canHoldArrows,
  canShootArrows,
  canUseBombs,
  canBombOrBonk,
  bottleCount,
  heartCount,
  hasHearts,
  canExtendMagic,
};
