/* @layer renderer-components @kind types */
import type { OptionDef, OptionValue, PondDemandView, PoolAccounting, RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { ImpactCell } from '@app/compounds/PoolImpactCell';
import type { LockedGroupsByTab, UnlockedGroupsByTab } from '@app/hooks/randomizer/option-tab-model';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

interface RotpOptionModel {
  snapshot: RandomizerOptionsSnapshot;
  choices: RandomizerOptionChoices;
  accounting: PoolAccounting | null;
  error: string | undefined;
  cellOf: (key: string) => ImpactCell;
  notes: readonly string[];
  pondDemands: PondDemandView;
  groups: UnlockedGroupsByTab;
  fixed: LockedGroupsByTab;
  valueOf: (option: OptionDef) => OptionValue;
  handleChange: ((next: RandomizerOptionChoices) => void) | undefined;
  handleRowChange: ((key: string, next: OptionValue) => void) | undefined;
}

export type { RotpOptionModel };
