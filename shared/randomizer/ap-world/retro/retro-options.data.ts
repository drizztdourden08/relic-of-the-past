/* @layer shared-game @kind data */
/**
 * The two retro shot-cost rows of the option catalog: synthetic, unlocked,
 * group 'items', so they sit under the retro switch they qualify. The switch
 * itself is the reference's own `retro_bow` row and stays where the dataclass
 * puts it (options.data.ts); only the two costs are this app's own question,
 * because the reference fixes them in its patcher and a cost is exactly the
 * sort of number a player wants to move.
 *
 * Both baselines are the reference's own patched bytes (retro-bow.data.ts), so
 * a fresh profile that turns retro on fires at 10 and 50, and a snapshot frozen
 * before these rows existed reads the same way.
 */
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.data';
import {
  RETRO_PRICE_CEILING, RETRO_SILVER_ARROW_COST, RETRO_SILVER_COST_KEY, RETRO_WOOD_ARROW_COST,
  RETRO_WOOD_COST_KEY,
} from './retro-bow.data';
import type { ApOptionDef } from '../options.type';
import type { OptionDescription } from '../option-description.type';

type Seed = Omit<ApOptionDef, 'description'>;

const costSeed = (key: string, displayName: string, baseline: number): Seed => ({
  key,
  displayName,
  group: 'items',
  kind: 'range',
  implementation: 'active',
  range: { min: 0, max: RETRO_PRICE_CEILING },
  apDefault: baseline,
  baseline,
  locked: false,
  synthetic: true,
});

const RETRO_OPTION_SEEDS: readonly Seed[] = [
  costSeed(RETRO_WOOD_COST_KEY, 'A plain shot costs', RETRO_WOOD_ARROW_COST),
  costSeed(RETRO_SILVER_COST_KEY, 'A silver shot costs', RETRO_SILVER_ARROW_COST),
];

/** Every key these rows own: the panel renders them inside the retro block. */
const RETRO_OPTION_KEYS: readonly string[] = RETRO_OPTION_SEEDS.map((seed) => seed.key);

const isRetroOptionKey = (key: string): boolean => RETRO_OPTION_KEYS.includes(key);

const RETRO_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = {
  [RETRO_WOOD_COST_KEY]: 'A shot you cannot afford does not fire.',
  [RETRO_SILVER_COST_KEY]: `Capped so the final fight's ${FINAL_FIGHT_SILVER_HITS} silver shots in a row `
    + 'fit in the biggest wallet.',
};

export { RETRO_OPTION_DESCRIPTIONS, RETRO_OPTION_KEYS, RETRO_OPTION_SEEDS, isRetroOptionKey };
