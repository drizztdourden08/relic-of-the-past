/* @layer renderer-components @kind types */
import type { ImpactCell } from '@app/compounds/PoolImpactCell';
import type {
  LockedGroupsByTab, OptionTabId, UnlockedGroupsByTab,
} from '@app/hooks/randomizer/option-tab-model';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { OptionDef, OptionValue } from '@rotp/randomizer';
import type { PondDemandView } from '@rotp/randomizer';

interface OptionTabBodyProps {
  tab: OptionTabId;
  groups: UnlockedGroupsByTab;
  lockedGroups: LockedGroupsByTab;
  values: Readonly<Record<string, OptionValue>>;
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  choices: RandomizerOptionChoices;
  seed: string;
  pondDemands: PondDemandView;
  notes: readonly string[];
  fillerHeadroom: number | null;
  onRowChange?: (key: string, next: OptionValue) => void;
  onChange?: (next: RandomizerOptionChoices) => void;
}

export type { OptionTabBodyProps };
