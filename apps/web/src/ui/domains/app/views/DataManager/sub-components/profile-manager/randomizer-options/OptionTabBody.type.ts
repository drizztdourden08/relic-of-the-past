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
  /** The live sections each list tab owns, already split. */
  groups: UnlockedGroupsByTab;
  /** The fixed sections each tab that shows some owns, already split. */
  lockedGroups: LockedGroupsByTab;
  /** The snapshot these choices would freeze: what the keyed blocks read. */
  values: Readonly<Record<string, OptionValue>>;
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  choices: RandomizerOptionChoices;
  /** The seed this profile will be generated with; the previews are read from it. */
  seed: string;
  /** What that seed's ponds ask for at each rung. */
  pondDemands: PondDemandView;
  /** Every fallback the capacity reader applied. */
  notes: readonly string[];
  /** Filler still in the pool; null when the pool could not be built. */
  fillerHeadroom: number | null;
  /** Both absent draw the tab read-only: every value as a tag, no control. */
  onRowChange?: (key: string, next: OptionValue) => void;
  onChange?: (next: RandomizerOptionChoices) => void;
}

export type { OptionTabBodyProps };
