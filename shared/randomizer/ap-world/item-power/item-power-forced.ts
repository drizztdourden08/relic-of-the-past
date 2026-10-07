/* @layer shared-game @kind logic */
/**
 * Which item-power rows the blade ticks have taken out of the player's hands,
 * and the one sentence that says why: the reading a panel shows, off exactly the
 * same condition the generator and the core arm from (item-power-rule.ts).
 *
 * The rule is already a MASK: five switches read as on the moment the blade
 * family can no longer meet the requirement they stand for, and the player's
 * own answer is kept untouched underneath so ticking a rung back on gives it
 * straight back. This file only names the masked rows so the panel can stop
 * showing a switch that says off while the seed is built with it on, which is a
 * control that lies about the seed is worse than no control at all.
 *
 * Two conditions, because they are different: no blade AT ALL, and
 * no blade that throws a BEAM. The second is the wider one, since the first rung
 * scores nothing against the seal or the last fight, so a file stuck on rung
 * one is walled off by three of the five while the other two still answer to
 * the player.
 */
import { ITEM_POWER_KEY } from './item-power.data';

/** Rows a seed with no blade at all cannot leave to the player. */
const FORCED_WITHOUT_BLADE: readonly string[] = [
  ITEM_POWER_KEY.swordlessMedallions,
  ITEM_POWER_KEY.pullableCurtains,
];

/** Rows a seed with no beam blade cannot leave to the player. */
const FORCED_WITHOUT_BEAM: readonly string[] = [
  ITEM_POWER_KEY.hammerTablets,
  ITEM_POWER_KEY.hammerLastFight,
  ITEM_POWER_KEY.hammerTowerSeal,
];

/**
 * The one sentence every masked row carries. Both conditions read the same on
 * the row because the row only has one thing to say: the seed is being built
 * with this on, and the ticks above are where that is undone. Which of the two
 * conditions masked it is already visible in WHICH rows went inert.
 */
const FORCED_ON_REASON = 'Forced on: No sword available requires this to complete the game';

/**
 * The forced rows, each with its reason. Empty while the blade family can
 * still reach both readings, which is every seed that keeps its ladder.
 */
const forcedItemPowerReasons = (
  swordReachable: boolean, beamSwordReachable: boolean,
): ReadonlyMap<string, string> => {
  const forced = new Map<string, string>();
  if (!swordReachable) for (const key of FORCED_WITHOUT_BLADE) forced.set(key, FORCED_ON_REASON);
  if (!beamSwordReachable) for (const key of FORCED_WITHOUT_BEAM) forced.set(key, FORCED_ON_REASON);
  return forced;
};

export { FORCED_ON_REASON, FORCED_WITHOUT_BEAM, FORCED_WITHOUT_BLADE, forcedItemPowerReasons };
