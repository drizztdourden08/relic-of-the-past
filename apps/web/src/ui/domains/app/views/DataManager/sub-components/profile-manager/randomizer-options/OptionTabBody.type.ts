/* @layer renderer-components @kind types */
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type {
  LockedGroupsByTab, OptionTabId, UnlockedGroupsByTab,
} from '@app/hooks/randomizer/option-tab-model';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';

interface OptionTabBodyProps {
  tab: OptionTabId;
  /** The live sections each list tab owns, already split. */
  groups: UnlockedGroupsByTab;
  /** The fixed sections each tab that shows some owns, already split. */
  lockedGroups: LockedGroupsByTab;
  /** The snapshot these choices would freeze: what the keyed blocks read. */
  values: Readonly<Record<string, ApOptionValue>>;
  valueOf: (option: ApOptionDef) => ApOptionValue;
  cellOf: (key: string) => ImpactCell;
  choices: RandomizerOptionChoices;
  /** Every fallback the capacity reader applied. */
  notes: readonly string[];
  /** Filler still in the pool; null when the pool could not be built. */
  fillerHeadroom: number | null;
  onRowChange: (key: string, next: ApOptionValue) => void;
  onChange: (next: RandomizerOptionChoices) => void;
}

export type { OptionTabBodyProps };
