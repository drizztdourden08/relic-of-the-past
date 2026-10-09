/* @layer renderer-components @kind types */
import type { ImpactCell } from '../PoolImpactCell';
import type { OptionDef, OptionGroup, OptionValue } from '@rotp/randomizer';

interface RandomizerOptionRowProps {
  option: OptionDef;
  value: OptionValue;
  onChange?: (value: OptionValue) => void;
  impact?: ImpactCell;
  disabled?: boolean;
  note?: string;
  readout?: boolean;
}

interface LockedOptionGroup {
  group: OptionGroup;
  options: OptionDef[];
}

interface CatalogByLock {
  unlocked: OptionDef[];
  unlockedGroups: LockedOptionGroup[];
  lockedGroups: LockedOptionGroup[];
}

export type { CatalogByLock, LockedOptionGroup, RandomizerOptionRowProps };
