/* @layer bridge-wasm @kind logic */
/**
 * The item-behaviour arms a session makes beside its placement: which rungs of
 * each tiered family exist, how helpful the items are, which items light an
 * unlit room, and whether the bow is fed rupees. All of them come off the
 * placement's own stats, so a stored seed is played under exactly the rules it
 * was rolled under.
 *
 * The lights matter here more than they look: the fill counts every ticked one
 * as satisfying a dark spot, so a seed may put something needed behind an
 * unlit room and hand the player a rod for it. Arming them is what makes that
 * rod actually light the room, and skipping the arm would leave the seed's own
 * rules describing a game that is not being played.
 *
 * The item-power pair the tier ticks decide is derived HERE instead of read
 * from the stats, by the same function the logic uses (item-power-rule.ts). A
 * seed with no beam blade in it needs the hammer to wake the tablets, and one
 * with no blade at all needs the medallion doors to take none; freezing that
 * pair at generation time would let a stored placement and the running game
 * disagree the day the derivation changes, so the derivation runs on both
 * sides instead.
 *
 * A placement with neither field (every seed rolled before these rows existed)
 * arms nothing at all: the full ladder and the unmodified game, which is what
 * it was generated against.
 */

import {
  REFERENCE_DARK_ROOM_SETTING,
} from '@shared/randomizer/ap-world/dark-rooms/dark-room-lights.data';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/ap-world/item-power/item-power.data';
import { DEFAULT_RETRO_BOW } from '@shared/randomizer/ap-world/retro/retro-bow.data';
import { retroVanillaShelves } from '@shared/randomizer/ap-world/retro/retro-shops';
import { NO_SHOP_SCOPE } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { derivedItemPower } from '@shared/randomizer/ap-world/item-power/item-power-rule';
import { DEFAULT_PROGRESSIVE_SETTING } from '@shared/randomizer/ap-world/progressive/progressive-families.data';
import { DEFAULT_PROGRESSIVE_MODES } from '@shared/randomizer/ap-world/progressive/progressive-modes.data';
import {
  beamSwordReachable, swordReachable,
} from '@shared/randomizer/ap-world/progressive/progressive-reach';
import { log } from '../../log-bus';
import { clearItemPower, setItemPower } from '../item-power';
import { clearProgressiveTiers, isFullLadder, setProgressiveTiers } from '../progressive-tiers';
import { clearRetroBow, setRetroBow } from '../retro-bow';
import { clearRetroShelves, setRetroShelves } from '../retro-shelf';
import { darkRoomLightWordOf } from '../dark-room-lights';
import type { ApPlacementStats } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { DarkRoomSetting } from '@shared/randomizer/ap-world/dark-rooms/dark-room.type';
import type { ItemPowerSetting } from '@shared/randomizer/ap-world/item-power/item-power.type';
import type { RetroBowSetting } from '@shared/randomizer/ap-world/retro/retro.type';
import type { RetroShelfStock } from '@shared/randomizer/ap-world/retro/retro-shops';
import type {
  ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/ap-world/progressive/progressive.type';

interface ItemBehaviorPlan {
  tiers: ProgressiveSetting;
  /** How each family's copies arrive: in order, or the rungs themselves. */
  modes: ProgressiveModeSetting;
  /** The setting after the tier-derived fallbacks: what the core is armed with. */
  itemPower: ItemPowerSetting;
  /** Which items the seed counted as a light, and so which the core must light with. */
  darkRooms: DarkRoomSetting;
  /** What a shot costs, and whether it costs anything at all. */
  retroBow: RetroBowSetting;
  /**
   * The arrow shelves the core restocks in place: the quiver's shelf and the
   * refills. Only a retro seed with VANILLA shops has any; a shuffled scope
   * puts the quiver in the item pool instead.
   */
  retroShelves: readonly RetroShelfStock[];
  /** Nothing to say: the full ladder and the unmodified game. */
  vanilla: boolean;
}

const itemBehaviorOf = (stats: ApPlacementStats): ItemBehaviorPlan => {
  const tiers = stats.progressiveTiers ?? DEFAULT_PROGRESSIVE_SETTING;
  const modes = stats.progressiveModes ?? DEFAULT_PROGRESSIVE_MODES;
  const itemPower = derivedItemPower(
    stats.itemPower ?? DEFAULT_ITEM_POWER, swordReachable(tiers), beamSwordReachable(tiers),
  );
  const retroBow = stats.retroBow ?? DEFAULT_RETRO_BOW;
  const retroShelves = retroVanillaShelves(stats.shops ?? NO_SHOP_SCOPE, retroBow);
  const darkRooms = stats.darkRooms ?? REFERENCE_DARK_ROOM_SETTING;
  const vanilla = isFullLadder(tiers, modes) && !retroBow.enabled
    && darkRoomLightWordOf(darkRooms) === 0
    && (Object.keys(itemPower) as Array<keyof ItemPowerSetting>)
      .every((field) => itemPower[field] === DEFAULT_ITEM_POWER[field]);
  return { tiers, modes, itemPower, darkRooms, retroBow, retroShelves, vanilla };
};

const armItemBehavior = (plan: ItemBehaviorPlan, tag: string): void => {
  if (plan.vanilla) {
    log.randomizer(`${tag} Item behaviour: every tier present and nothing altered, core not armed`);
    return;
  }
  setProgressiveTiers(plan.tiers, plan.modes);
  setItemPower(plan.itemPower, plan.darkRooms);
  // Only a retro seed arms the bow: with it off the shot branch has to stay the
  // vendored expression, and an armed pair of costs with the gate open would be
  // charging for shots the seed never priced.
  if (plan.retroBow.enabled) setRetroBow(plan.retroBow);
  // Armed under the same gate the costs open, so an unarmed bow never finds a
  // restocked shelf and a restocked shelf never outlives its bow.
  if (plan.retroBow.enabled) setRetroShelves(plan.retroShelves);
};

const disarmItemBehavior = (): void => {
  clearProgressiveTiers();
  clearItemPower();
  clearRetroShelves();
  clearRetroBow();
};

export { armItemBehavior, disarmItemBehavior, itemBehaviorOf };
export type { ItemBehaviorPlan };
