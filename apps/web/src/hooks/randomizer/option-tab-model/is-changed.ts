/* @layer renderer-hooks @kind logic */
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';

const isChanged = (option: OptionDef, value: OptionValue | undefined): boolean =>
  value !== undefined && String(value) !== String(option.baseline);

export { isChanged };
