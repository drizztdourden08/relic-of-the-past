/* @layer renderer-components @kind types */
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { OptionDef, OptionValue } from '@rotp/randomizer';

interface UpcomingTabBodyProps {
  title: string;
  groups: readonly LockedOptionGroup[];
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  readout?: boolean;
}

export type { UpcomingTabBodyProps };
