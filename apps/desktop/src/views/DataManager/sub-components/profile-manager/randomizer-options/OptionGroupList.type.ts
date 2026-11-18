/* @layer renderer-components @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { LockedOptionGroup } from '@app/compounds/RandomizerOptionRow';
import type { ImpactCell } from '@app/compounds/PoolImpactCell';
import type { OptionDef, OptionValue } from '@rotp/randomizer';

interface OptionGroupListProps {
  groups: readonly LockedOptionGroup[];
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  live?: boolean;
  frozenKeys?: ReadonlySet<string>;
  notes?: ReadonlyMap<string, Message>;
  onRowChange?: (key: string, next: OptionValue) => void;
  readout?: boolean;
}

export type { OptionGroupListProps };
