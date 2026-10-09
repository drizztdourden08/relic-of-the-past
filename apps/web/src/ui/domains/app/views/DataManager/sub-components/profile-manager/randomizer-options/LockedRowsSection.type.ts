/* @layer renderer-components @kind types */
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';

interface LockedRowsSectionProps {
  title: string;
  groups: readonly LockedOptionGroup[];
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  readout?: boolean;
}

export type { LockedRowsSectionProps };
