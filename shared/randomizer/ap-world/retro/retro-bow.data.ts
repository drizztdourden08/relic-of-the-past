/* @layer shared-game @kind data */
/**
 * Retro bow: the option keys, the arrow items it takes out of the pool, the
 * quiver the one surviving purchase sells, and the two per-shot costs, each
 * a number the reference project's own patcher writes, not one invented here.
 *
 * PLAIN SHOT, 10. Rom.py 1453 writes 0x0A to 0x180176, the wood arrow cost of
 * the rupee bow.
 *
 * SILVER SHOT, 50. Rom.py 1454 writes 0x32 to 0x180178, the silver arrow cost.
 *
 * THE QUIVER, 80. Shops.py set_up_shops locks a single-arrow purchase into one
 * shelf at 80 and pushes the same purchase into five more shops at the same
 * 80. It is bought ONCE (Rom.py 1451 skips it in shops afterwards) and it is
 * what lets the bow fire at all. The reference spells that purchase as a
 * single arrow because a single arrow is the receipt its patched game hands
 * over; this app gives it the name it earns, a QUIVER, and an item record of
 * its own (records/items/randomizer.ts) with its own picture and its own
 * receipt line. Its price stays a constant, not a slider: the two
 * costs above are the question a player actually has.
 *
 * The cost ceiling is the vanilla wallet, because a shot that costs more than
 * a file can carry could never be fired; the logic brings it back down to
 * whatever the profile's own wallet really reaches (retro-logic.ts).
 */
import { PROJECTILES_UPGRADE_NAMES } from '@shared/game/data/capacity-upgrade-names.data';
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.data';
import type { RetroBowSetting } from './retro.type';

const RETRO_BOW_KEY = 'retro_bow';
const RETRO_WOOD_COST_KEY = 'retro_arrow_cost_wood';
const RETRO_SILVER_COST_KEY = 'retro_arrow_cost_silver';

/** Rom.py 1453, 0x180176: the rupee bow's plain shot. */
const RETRO_WOOD_ARROW_COST = 10;

/** Rom.py 1454, 0x180178: the rupee bow's silver shot. */
const RETRO_SILVER_ARROW_COST = 50;

/** Shops.py set_up_shops: what the one surviving purchase asks for. */
const RETRO_QUIVER_PRICE = 80;

/** A vanilla wallet's top, the most a shot could ever ask for. */
const RETRO_PRICE_CEILING = 999;

/** The two arrow pickups the pool carries; retro leaves none of them in it. */
const RETRO_ARROW_PICKUPS: readonly string[] = ['Single Arrow', 'Arrows (10)'];

/** What a pickup retro takes out leaves behind (ItemPool.py 725-727). */
const RETRO_REPLACEMENT_ITEM = 'Rupees (5)';

/**
 * The item that lets the bow fire, by its pool name. One record carries it
 * (records/items/randomizer.ts): its own name, its own picture, and the
 * single-arrow receipt as its alias, because that receipt is what the running
 * game reads as "the bow may fire" (core/game-hooks/retro_bow.c).
 */
const RETRO_QUIVER_ITEM = 'Quiver';

/**
 * The arrow capacity upgrades. The reference strips these under retro too (ItemPool.py
 * 726), because a carried count stops meaning anything once every shot is paid
 * for in rupees. This app reaches the same pool by a different door: the
 * projectiles family is read as Vanilla while retro is on
 * (capacity/retro-projectiles.ts), so its card on the capacity tab goes inert
 * with the reason on it and no upgrade of this family enters the pool. The
 * names are listed so the correspondence is written down where a reader will
 * find it.
 */
const RETRO_ARROW_CAPACITY_UPGRADES: readonly string[] = [...PROJECTILES_UPGRADE_NAMES];

const DEFAULT_RETRO_BOW: RetroBowSetting = {
  enabled: false,
  woodArrowCost: RETRO_WOOD_ARROW_COST,
  silverArrowCost: RETRO_SILVER_ARROW_COST,
};

/**
 * The most one shot can ask for. The silver shot is the dear one, and a bow
 * that has climbed to it never goes back.
 */
const dearestShotCost = (setting: RetroBowSetting): number =>
  Math.max(setting.woodArrowCost, setting.silverArrowCost);

/**
 * What the wallet must hold AT ONCE for the SHOTS to be worth taking: a plain
 * shot, and the final fight's silver shots back to back (final-fight.data.ts).
 * Nothing can be farmed once that fight starts, so the last term is the count
 * times the cost, not the cost alone. This is the reading a seed that hands
 * the quiver over as a found item is held to: nothing was paid for it.
 */
const retroShotWalletNeed = (setting: RetroBowSetting): number => Math.max(
  setting.woodArrowCost,
  FINAL_FIGHT_SILVER_HITS * setting.silverArrowCost,
);

/**
 * The same, plus the quiver's own asking price: the reading a seed that SELLS
 * the quiver is held to, because a wallet that cannot hold 80 can never make
 * the purchase and the bow never fires at all.
 */
const retroWalletNeed = (setting: RetroBowSetting): number =>
  Math.max(RETRO_QUIVER_PRICE, retroShotWalletNeed(setting));

export {
  DEFAULT_RETRO_BOW,
  RETRO_ARROW_PICKUPS,
  RETRO_BOW_KEY,
  RETRO_PRICE_CEILING,
  RETRO_QUIVER_ITEM,
  RETRO_QUIVER_PRICE,
  RETRO_ARROW_CAPACITY_UPGRADES,
  RETRO_REPLACEMENT_ITEM,
  RETRO_SILVER_ARROW_COST,
  RETRO_SILVER_COST_KEY,
  RETRO_WOOD_ARROW_COST,
  RETRO_WOOD_COST_KEY,
  dearestShotCost,
  retroShotWalletNeed,
  retroWalletNeed,
};
