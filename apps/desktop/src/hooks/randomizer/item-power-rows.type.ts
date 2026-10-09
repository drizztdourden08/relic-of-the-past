/* @layer renderer-hooks @kind types */
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';

interface ForcedItemPowerRows {
  keys: ReadonlySet<string>;
  notes: ReadonlyMap<string, string>;
  valueOf: (option: OptionDef) => OptionValue;
}

export type { ForcedItemPowerRows };
