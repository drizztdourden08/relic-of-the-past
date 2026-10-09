/* @layer renderer-components @kind types */
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type {
  LockedGroupsByTab, OptionTabId, UnlockedGroupsByTab,
} from '@app/hooks/randomizer/option-tab-model';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';
import type { PondDemandView } from '@shared/randomizer/world/pond/pond-ask.type';

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
