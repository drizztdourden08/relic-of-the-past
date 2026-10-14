/* @layer renderer-components @kind logic */
import type { OptionDef } from '@rotp/randomizer';

const tagFor = (option: OptionDef): string | null => {
  if (!option.locked) return null;
  if (option.implementation === 'not-implemented') return 'not in this version';
  if (option.implementation === 'not-applicable') return 'not used here';
  return 'fixed';
};

export { tagFor };
