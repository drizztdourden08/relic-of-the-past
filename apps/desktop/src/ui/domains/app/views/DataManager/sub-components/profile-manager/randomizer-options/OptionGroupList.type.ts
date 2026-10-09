/* @layer renderer-components @kind types */
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { OptionDef, OptionValue } from '@rotp/randomizer';

interface OptionGroupListProps {
  groups: readonly LockedOptionGroup[];
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  live?: boolean;
  frozenKeys?: ReadonlySet<string>;
  notes?: ReadonlyMap<string, string>;
  onRowChange?: (key: string, next: OptionValue) => void;
  readout?: boolean;
}

export type { OptionGroupListProps };
