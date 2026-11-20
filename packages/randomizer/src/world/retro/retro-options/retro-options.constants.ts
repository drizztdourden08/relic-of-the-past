/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { FINAL_FIGHT_SILVER_HITS } from '../../final-fight.constants';
import {
  RETRO_PRICE_CEILING, RETRO_SILVER_ARROW_COST, RETRO_SILVER_COST_KEY, RETRO_WOOD_ARROW_COST,
  RETRO_WOOD_COST_KEY,
} from '../retro-bow.constants';
import type { OptionSeed } from '../../options.type';
import type { OptionDescriptionSource } from '../../option-description.type';

const RETRO_OPTION_SEEDS: readonly OptionSeed[] = [
  {
    key: RETRO_WOOD_COST_KEY,
    displayName: msg('randomizer-world:option.retro_wood'),
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
    displayName: msg('randomizer-world:option.retro_silver'),
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

const RETRO_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescriptionSource>> = {
  [RETRO_WOOD_COST_KEY]: msg('randomizer-world:desc.retro_wood'),
  [RETRO_SILVER_COST_KEY]: msg('randomizer-world:desc.retro_silver', { hits: FINAL_FIGHT_SILVER_HITS }),
};

export { RETRO_OPTION_DESCRIPTIONS, RETRO_OPTION_KEYS, RETRO_OPTION_SEEDS };
