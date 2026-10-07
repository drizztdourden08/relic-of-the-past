/* @layer shared-game @kind logic */
/**
 * THE item-power reading, asked in one place: what is actually in force for
 * this world? Two of the eight switches are read, not obeyed, because
 * a tier tick can make the requirement they stand for unmeetable:
 *
 *  - no beam blade can be found anywhere in the seed, so a rule that insists
 *    on one would wall off the tablets forever. The hammer stands in instead,
 *    which is exactly the fallback the reference's own swordless mode uses
 *    (Rules.py can_retrieve_tablet, Rom.py 180044);
 *  - no blade at all can be found, so the medallion doors take none, again as
 *    the reference's swordless mode has it (Rom.py 180041).
 *
 * Both are MASKS, not rewrites: the player's own switch is untouched, so
 * ticking a blade rung back on gives the requirement straight back. The
 * derived pair is also what the running game is armed with, so the logic and
 * the core can never disagree about which fallback is live.
 */
import { DEFAULT_ITEM_POWER } from './item-power.data';
import { beamSwordReachable, progressiveSettingOf, swordReachable } from '../progressive/progressive-reach';
import type { ApWorld } from '../world.type';
import type { ItemPowerSetting } from './item-power.type';

/** What the player asked for; a world built before the rows existed asks for the normal step. */
const requestedItemPowerOf = (world: ApWorld): ItemPowerSetting =>
  world.options.itemPower ?? DEFAULT_ITEM_POWER;

/**
 * The derivation off a setting/tier pair, for the session arming and the panel.
 *
 * The two hammer stand-ins hang off the BEAM reading, not the blade one: the
 * first rung scores nothing at all against either the seal or the last fight (both
 * carry a zero in that damage column), so a file stuck on it is walled off exactly as
 * a bladeless one is, and needs the hammer just the same.
 */
const derivedItemPower = (
  requested: ItemPowerSetting, sword: boolean, beamSword: boolean,
): ItemPowerSetting => ({
  ...requested,
  hammerTablets: requested.hammerTablets || !beamSword,
  swordlessMedallions: requested.swordlessMedallions || !sword,
  pullableCurtains: requested.pullableCurtains || !sword,
  hammerLastFight: requested.hammerLastFight || !beamSword,
  hammerTowerSeal: requested.hammerTowerSeal || !beamSword,
});

/** The requested setting with the unmeetable requirements masked off. */
const itemPowerOf = (world: ApWorld): ItemPowerSetting => {
  const tiers = progressiveSettingOf(world);
  return derivedItemPower(requestedItemPowerOf(world), swordReachable(tiers), beamSwordReachable(tiers));
};

export { derivedItemPower, itemPowerOf, requestedItemPowerOf };
