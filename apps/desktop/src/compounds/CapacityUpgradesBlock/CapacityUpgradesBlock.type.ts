/* @layer renderer-components @kind types */
import type { CapacityRowModel, CapacityRowState } from '../CapacityFamilyRow';
import type { CapacityFamilyId, FamilyBonus, OptionDef } from '@rotp/randomizer';

interface CapacityChangeHandlers {
  onChange?: (family: CapacityFamilyId, next: CapacityRowState) => void;
  onBonusChange?: (family: CapacityFamilyId, next: FamilyBonus) => void;
  onEnabledChange?: (enabled: boolean) => void;
  onProgressiveChange?: (progressive: boolean) => void;
}

interface CapacityUpgradesBlockProps extends CapacityChangeHandlers {
  rows: readonly CapacityRowModel[];
  notes: readonly string[];
  enabledOption?: OptionDef;
  enabled?: boolean;
  progressiveOption?: OptionDef;
  progressive?: boolean;
  readOnly?: boolean;
}

interface CapacityRowsProps extends Omit<CapacityChangeHandlers, 'onEnabledChange'> {
  rows: readonly CapacityRowModel[];
  progressiveOption?: OptionDef;
  progressive: boolean;
  frozen: boolean;
  readOnly: boolean;
}

export type { CapacityChangeHandlers, CapacityRowsProps, CapacityUpgradesBlockProps };
