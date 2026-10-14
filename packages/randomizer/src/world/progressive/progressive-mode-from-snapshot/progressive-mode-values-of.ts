/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import { progressiveModeKeyOf } from '../progressive-mode-keys';
import type { OptionValue } from '../../options.type';
import type { ProgressiveModeSetting } from '../progressive.type';

const progressiveModeValuesOf = (modes: Partial<ProgressiveModeSetting> | undefined): Record<string, OptionValue> =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family): [string, OptionValue] => [
    progressiveModeKeyOf(family.id),
    modes?.[family.id] as OptionValue,
  ]));

export { progressiveModeValuesOf };
