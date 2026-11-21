/* @layer renderer-hooks @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { OptionDef, OptionValue } from '@rotp/randomizer';

interface ForcedItemPowerRows {
  keys: ReadonlySet<string>;
  notes: ReadonlyMap<string, Message>;
  valueOf: (option: OptionDef) => OptionValue;
}

export type { ForcedItemPowerRows };
