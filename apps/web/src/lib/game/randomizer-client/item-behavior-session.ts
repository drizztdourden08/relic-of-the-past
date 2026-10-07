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
 */

import { DEFAULT_ITEM_POWER } from '@shared/randomizer/world/item-power/item-power.data';
import { retroVanillaShelves } from '@shared/randomizer/world/retro/retro-shops';
import { derivedItemPower } from '@shared/randomizer/world/item-power/item-power-rule';
import {
  beamSwordReachable, swordReachable,
} from '@shared/randomizer/world/progressive/progressive-reach';
import { log } from '../../log-bus';
import { clearItemPower, setItemPower } from '../item-power';
import { clearProgressiveTiers, isFullLadder, setProgressiveTiers } from '../progressive-tiers';
import { clearRetroBow, setRetroBow } from '../retro-bow';
import { clearRetroShelves, setRetroShelves } from '../retro-shelf';
import { darkRoomLightWordOf } from '../dark-room-lights';
import { setSessionStoryGates } from '../story-gates';
import type { StoryGateSetting } from '@shared/randomizer/world/story-gates/story-gate.type';
import type { PlacementStats } from '@shared/randomizer/world/fill/placement.type';
import type { DarkRoomSetting } from '@shared/randomizer/world/dark-rooms/dark-room.type';
import type { ItemPowerSetting } from '@shared/randomizer/world/item-power/item-power.type';
import type { RetroBowSetting } from '@shared/randomizer/world/retro/retro.type';
import type { RetroShelfStock } from '@shared/randomizer/world/retro/retro-shops';
import type {
  ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/world/progressive/progressive.type';

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
  /** Which recorded event each story gate reads, and what the counts ask for. */
  storyGates: StoryGateSetting;
  /**
   * The arrow shelves the core restocks in place: the quiver's shelf and the
   * refills. Only a retro seed with VANILLA shops has any; a shuffled scope
   * puts the quiver in the item pool instead.
   */
  retroShelves: readonly RetroShelfStock[];
  /** Nothing to say: the full ladder and the unmodified game. */
  vanilla: boolean;
}

const itemBehaviorOf = (stats: PlacementStats): ItemBehaviorPlan => {
  const { progressiveTiers: tiers, progressiveModes: modes, retroBow, darkRooms, storyGates } = stats;
  const itemPower = derivedItemPower(stats.itemPower, swordReachable(tiers), beamSwordReachable(tiers));
  const retroShelves = retroVanillaShelves(stats.shops, retroBow);
  const vanilla = isFullLadder(tiers, modes) && !retroBow.enabled
    && darkRoomLightWordOf(darkRooms) === 0
    && (Object.keys(itemPower) as Array<keyof ItemPowerSetting>)
      .every((field) => itemPower[field] === DEFAULT_ITEM_POWER[field]);
  return { tiers, modes, itemPower, darkRooms, retroBow, retroShelves, storyGates, vanilla };
};

const armItemBehavior = (plan: ItemBehaviorPlan, tag: string): void => {
  // The story gates are armed for every seed, altered or not: the seed's own choices replace
  // the settings half of word 5 while it runs (story-gates.ts).
  setSessionStoryGates(plan.storyGates);
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
  setSessionStoryGates(null);
  clearProgressiveTiers();
  clearItemPower();
  clearRetroShelves();
  clearRetroBow();
};

export { armItemBehavior, disarmItemBehavior, itemBehaviorOf };
export type { ItemBehaviorPlan };
