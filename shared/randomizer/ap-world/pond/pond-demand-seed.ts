/* @layer shared-game @kind logic */
/**
 * THE POND DEMANDS OF ONE SEED, and the only place they are rolled.
 *
 * A demand is drawn on a stream of the SEED's own, never the attempt seed the
 * fill runs on, exactly as the rolled flags are (fill/generate-ap.ts): a seed
 * that needs a second attempt keeps the demands the profile already settled,
 * and the options panel can show them before anything is generated. The
 * stream carries its own name, so no other roll drawing from the same seed can
 * ever land on it.
 *
 * ONE FUNCTION, TWO CALLERS. The generator records what this returns on the
 * placement and the panel previews it, so the preview and the seed cannot
 * disagree: they are the same roll, not two readings of one rule.
 *
 * ONLY A CUSTOM POND ASKS. A pond at its native economy charges what it always
 * charged, and the core arms a demand row for a custom pond alone
 * (randomizer-client/pond-demand-rows.ts), so rolling one anywhere else put a
 * demand into the access rules (rules/pond-demands.ts) that the water would
 * never ask for: the logic could hold a rung behind five bombs while the pond
 * took its hundred rupees. The roll, the rules, the core and the panel now all
 * read the same mode.
 *
 * The item pool arrives as a THUNK, the way it always has. Only an item demand
 * needs it, and reading it means building a pool, so a profile with that row
 * unticked never pays for one.
 */
import { createRng } from '../../rng';
import { POND_INSTANCES } from './pond-instances.data';
import { askOfSetting } from './pond-ask-from-snapshot';
import { pondPlanOf } from './pond-plan';
import { rollPondDemands } from './pond-demand-roll';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondDemandView } from './pond-ask.type';
import type { PondCustomSetting } from './pond-profile.type';
import type { PondInstance } from './pond-instance.type';
import type { PondProfiles } from './pond-profiles.type';
import type { ShopPrice } from '../shops/shop-price.type';

/** Nothing rolled: the reading a pond with no ladder and no demand gets. */
const NO_POND_DEMANDS: PondDemandView = {};

/** The stream a seed's demands are drawn on, named so no other roll shares it. */
const pondDemandStreamOf = (seed: string): string => `${seed}:pond-demands`;

/** The stream the candidate item pool is built on, for the same reason. */
const pondItemPoolStreamOf = (seed: string): string => `${seed}:pond-item-pool`;

/** One pond that asks, with the setting that says what and how steeply. */
interface AskingPond {
  pond: PondInstance;
  setting: PondCustomSetting;
}

/** The ponds a demand may be rolled for: the custom ones, in the panel's own order. */
const askingPondsOf = (ponds: PondProfiles): readonly AskingPond[] =>
  POND_INSTANCES.flatMap((pond) => {
    const setting = ponds[pond.id];
    return setting.mode === 'custom' ? [{ pond, setting }] : [];
  });

interface PondDemandInput {
  /** The profile's own seed, never an attempt seed derived from it. */
  seed: string;
  ponds: PondProfiles;
  capacity: CapacityProfile;
  /** This seed's own item pool, read only when a pond may ask to see an item. */
  itemPool: () => readonly string[];
}

const pondDemandsOfSeed = (input: PondDemandInput): PondDemandView => {
  const { seed, ponds, capacity, itemPool } = input;
  const asking = askingPondsOf(ponds);
  const asksForItem = asking.some(({ setting }) => askOfSetting(setting).item.enabled);
  const pool = asksForItem ? itemPool() : [];
  const rng = createRng(pondDemandStreamOf(seed));
  const demands: Record<string, ShopPrice> = {};
  for (const { pond, setting } of asking) {
    Object.assign(demands, rollPondDemands(
      pondPlanOf(setting, pond), askOfSetting(setting), setting.shape, rng, capacity, pool,
    ));
  }
  return demands;
};

export { NO_POND_DEMANDS, pondDemandStreamOf, pondDemandsOfSeed, pondItemPoolStreamOf };
export type { PondDemandInput };
