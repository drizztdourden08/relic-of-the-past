/* @layer shared-game @kind data */
import { FINAL_FIGHT_SILVER_HITS } from '../../final-fight.data';
import {
  RETRO_PRICE_CEILING, RETRO_SILVER_ARROW_COST, RETRO_SILVER_COST_KEY, RETRO_WOOD_ARROW_COST,
  RETRO_WOOD_COST_KEY,
} from '../retro-bow.data';
import type { OptionSeed } from '../../options.type';
import type { OptionDescription } from '../../option-description.type';

const RETRO_OPTION_SEEDS: readonly OptionSeed[] = [
  {
    key: RETRO_WOOD_COST_KEY,
    displayName: 'A plain shot costs',
    group: 'items',
    kind: 'range',
    implementation: 'active',
    range: { min: 0, max: RETRO_PRICE_CEILING },
    sourceDefault: RETRO_WOOD_ARROW_COST,
    baseline: RETRO_WOOD_ARROW_COST,
    locked: false,
    synthetic: true,
  },
  {
    key: RETRO_SILVER_COST_KEY,
    displayName: 'A silver shot costs',
    group: 'items',
    kind: 'range',
    implementation: 'active',
    range: { min: 0, max: RETRO_PRICE_CEILING },
    sourceDefault: RETRO_SILVER_ARROW_COST,
    baseline: RETRO_SILVER_ARROW_COST,
    locked: false,
    synthetic: true,
  },
];

const RETRO_OPTION_KEYS: readonly string[] = [RETRO_WOOD_COST_KEY, RETRO_SILVER_COST_KEY];

const RETRO_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = {
  [RETRO_WOOD_COST_KEY]: 'A shot you cannot afford does not fire.',
  [RETRO_SILVER_COST_KEY]: `Capped so the final fight's ${FINAL_FIGHT_SILVER_HITS} silver shots in a row `
    + 'fit in the biggest wallet.',
};

export { RETRO_OPTION_DESCRIPTIONS, RETRO_OPTION_KEYS, RETRO_OPTION_SEEDS };
