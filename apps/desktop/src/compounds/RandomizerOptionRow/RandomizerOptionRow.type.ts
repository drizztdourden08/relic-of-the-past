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

interface OptionControlProps {
  option: OptionDef;
  value: OptionValue;
  frozen: boolean;
  readout: boolean;
  onChange?: (value: OptionValue) => void;
}

interface OptionTextProps {
  option: OptionDef;
  note?: string;
  forced: boolean;
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

export type { CatalogByLock, LockedOptionGroup, OptionControlProps, OptionTextProps, RandomizerOptionRowProps };
