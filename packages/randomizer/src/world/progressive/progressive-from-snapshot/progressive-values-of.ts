/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.data';
import { progressiveTierKeyOf } from '../progressive-option-keys';
import { defaultTickOf } from './default-tick-of';
import type { OptionValue } from '../../options.type';
import type { ProgressiveSetting } from '../progressive.type';

const progressiveValuesOf = (setting: ProgressiveSetting): Record<string, OptionValue> =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.flatMap((family) =>
    family.tiers.map((_tier, index): [string, OptionValue] => [
      progressiveTierKeyOf(family.id, index),
      setting[family.id][index] ?? defaultTickOf(family.id, index),
    ])));

export { progressiveValuesOf };
