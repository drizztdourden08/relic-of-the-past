/* @layer renderer-hooks @kind logic */
import type { OptionDef, OptionValue } from '@rotp/randomizer';

const isChanged = (option: OptionDef, value: OptionValue | undefined): boolean =>
  value !== undefined && String(value) !== String(option.baseline);

export { isChanged };
