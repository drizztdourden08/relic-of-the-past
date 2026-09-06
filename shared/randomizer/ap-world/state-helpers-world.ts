/* @layer shared-game @kind logic */
/**
 * World/combat helpers ported from Archipelago worlds/alttp/StateHelpers.py
 * (python is_not_bunny, can_bomb_clip, has_crystals, has_triforce_pieces,
 * can_activate_crystal_switch, can_kill_most_things, can_kill_standard_start,
 * can_get_good_bee, can_retrieve_tablet, has_misery_mire_medallion,
 * has_turtle_rock_medallion, can_boots_clip_lw/dw, can_get_glitched_speed_dw).
 * The world is never inverted; enemy shuffle off; enemy health
 * default; goal is boss-defeat so no treasure-piece threshold applies.
 */
import { CRYSTAL_ITEMS, BOTTLE_ITEMS, ITEM, REGION_NAME } from './item-names.data';
import {
  canExtendMagic,
  canShootArrows,
  canUseBombs,
  hasBeamSword,
  hasMeleeWeapon,
  hasSword,
} from './state-helpers';
import { itemPowerOf } from './item-power/item-power-rule';
import type { ApRegion } from './region.type';
import type { CollectionState } from './collection-state';

/** Non-inverted: the transform is suppressed by the pearl or by first-world ground. */
const isNotBunny = (state: CollectionState, region: ApRegion): boolean =>
  state.has(ITEM.moonPearl) || region.isLightWorld;

/** Glitch helper — unused under no-glitches; ported for table completeness. */
const canBombClip = (state: CollectionState, region: ApRegion): boolean =>
  canUseBombs(state) && isNotBunny(state, region) && state.has(ITEM.pegasusBoots);

const hasCrystals = (state: CollectionState, count: number): boolean =>
  state.countGroup(CRYSTAL_ITEMS) >= count;

/** Goal is boss-defeat in the baseline: no pieces are ever required. */
const hasTriforcePieces = (state: CollectionState, required = 0): boolean =>
  state.count(ITEM.triforcePiece) + state.count(ITEM.powerStar) >= required;

const canActivateCrystalSwitch = (state: CollectionState): boolean =>
  hasMeleeWeapon(state)
  || canUseBombs(state)
  || canShootArrows(state)
  || state.hasAny([
    ITEM.hookshot, ITEM.caneOfSomaria, ITEM.caneOfByrna, ITEM.fireRod, ITEM.iceRod,
    ITEM.blueBoomerang, ITEM.redBoomerang,
  ]);

/** Enemy shuffle off; enemy health default (so the bomb fallback applies). */
const canKillMostThings = (state: CollectionState, enemies = 5): boolean =>
  hasMeleeWeapon(state)
  || state.has(ITEM.caneOfSomaria)
  || (state.has(ITEM.caneOfByrna) && (enemies < 6 || canExtendMagic(state)))
  || canShootArrows(state)
  || state.has(ITEM.fireRod)
  || canUseBombs(state, enemies * 4);

/** Standard-mode escape kill helper (the escape assist covers the ammo paths). */
const canKillStandardStart = (state: CollectionState, enemies = 5): boolean =>
  hasMeleeWeapon(state)
  || state.has(ITEM.caneOfSomaria)
  || (state.has(ITEM.caneOfByrna) && (enemies < 6 || canExtendMagic(state)))
  || state.hasAny([ITEM.bow, ITEM.progressiveBow])
  || state.has(ITEM.fireRod)
  || canUseBombs(state, enemies);

const canGetGoodBee = (state: CollectionState): boolean => {
  const cave = state.world.regions.get(REGION_NAME.coldBeeCave);
  return cave !== undefined
    && state.hasGroup(BOTTLE_ITEMS)
    && state.has(ITEM.bugCatchingNet)
    && (state.has(ITEM.pegasusBoots) || (hasSword(state) && state.has(ITEM.quake)))
    && state.canReachRegion(cave.name)
    && isNotBunny(state, cave);
};

/**
 * python can_retrieve_tablet. The reference's swordless branch is asked here as
 * a setting instead of a mode (item-power/): the hammer wakes a tablet when the
 * player asked for it, and always when no beam blade could ever be found, which
 * would otherwise leave the tablets behind a requirement nothing can meet.
 */
const canRetrieveTablet = (state: CollectionState): boolean =>
  state.has(ITEM.bookOfMudora)
  && (hasBeamSword(state) || (itemPowerOf(state.world).hammerTablets && state.has(ITEM.hammer)));

/**
 * Rules.py swordless_rules 1076-1077: the medallion doors take no blade under
 * the reference's swordless mode. Asked here as the setting that mode implied,
 * so a seed with no blade in it can still open them.
 */
const canUseMedallion = (state: CollectionState): boolean =>
  itemPowerOf(state.world).swordlessMedallions || hasSword(state);

const hasMireMedallion = (state: CollectionState): boolean =>
  state.has(state.world.options.medallions.mire);

const hasTurtleRockMedallion = (state: CollectionState): boolean =>
  state.has(state.world.options.medallions.turtleRock);

/** Glitch helpers — unused under no-glitches; ported for table completeness. */
const canBootsClipLw = (state: CollectionState): boolean => state.has(ITEM.pegasusBoots);

const canBootsClipDw = (state: CollectionState): boolean =>
  state.has(ITEM.pegasusBoots) && state.has(ITEM.moonPearl);

const canGetGlitchedSpeedDw = (state: CollectionState): boolean =>
  state.has(ITEM.pegasusBoots)
  && (state.has(ITEM.hookshot) || hasSword(state))
  && state.has(ITEM.moonPearl);

export {
  isNotBunny,
  canBombClip,
  hasCrystals,
  hasTriforcePieces,
  canActivateCrystalSwitch,
  canKillMostThings,
  canKillStandardStart,
  canGetGoodBee,
  canRetrieveTablet,
  canUseMedallion,
  hasMireMedallion,
  hasTurtleRockMedallion,
  canBootsClipLw,
  canBootsClipDw,
  canGetGlitchedSpeedDw,
};
