/* @layer renderer-components @kind types */
import type { LockedGroupsByTab, OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { OptionDef, OptionValue } from '@rotp/randomizer';

interface SubjectFixedRowsProps {
  tab: OptionTabId;
  lockedGroups: LockedGroupsByTab;
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  readout?: boolean;
}

export type { SubjectFixedRowsProps };
