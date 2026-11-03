/* @layer renderer-components @kind types */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { OptionDef, OptionValue } from '@rotp/randomizer';

interface OptionFactGroup {
  title: string;
  facts: FactsPanelFact[];
}

interface ChangedOption {
  option: OptionDef;
  value: OptionValue;
}

type OptionScope = 'changed' | 'all';

export type { ChangedOption, OptionFactGroup, OptionScope };
