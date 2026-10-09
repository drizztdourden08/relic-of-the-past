/* @layer renderer-hooks @kind types */
import type { OptionDef, OptionValue } from '@rotp/randomizer';

interface ForcedItemPowerRows {
  keys: ReadonlySet<string>;
  notes: ReadonlyMap<string, string>;
  valueOf: (option: OptionDef) => OptionValue;
}

export type { ForcedItemPowerRows };
