/* @layer shared-game @kind constants */
import { WORLD_OPTION_SEEDS } from './world-option-seeds.constants';
import { ITEM_OPTION_SEEDS } from './item-option-seeds.constants';
import { SESSION_OPTION_SEEDS } from './session-option-seeds.constants';
import { describeOption } from './describe-option';
import type { OptionDef, OptionValue } from '../options.type';

const optionCatalog: readonly OptionDef[] = [...WORLD_OPTION_SEEDS, ...ITEM_OPTION_SEEDS, ...SESSION_OPTION_SEEDS]
  .map((seed) => ({ ...seed, ...describeOption(seed.key) }));

const optionByKey: ReadonlyMap<string, OptionDef> =
  new Map(optionCatalog.map((option) => [option.key, option]));

const baselineValues: Readonly<Record<string, OptionValue>> =
  Object.fromEntries(optionCatalog.map((option) => [option.key, option.baseline]));

export { baselineValues, optionByKey, optionCatalog };
