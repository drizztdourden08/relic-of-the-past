/* @layer renderer-components @kind types */
import type { CapacityRowModel, CapacityRowState } from '../CapacityFamilyRow';
import type { CapacityFamilyId, FamilyBonus, OptionDef } from '@rotp/randomizer';

interface CapacityUpgradesBlockProps {
  rows: readonly CapacityRowModel[];
  notes: readonly string[];
  enabledOption?: OptionDef;
  enabled?: boolean;
  progressiveOption?: OptionDef;
  progressive?: boolean;
  readOnly?: boolean;
  onChange?: (family: CapacityFamilyId, next: CapacityRowState) => void;
  onBonusChange?: (family: CapacityFamilyId, next: FamilyBonus) => void;
  onEnabledChange?: (enabled: boolean) => void;
  onProgressiveChange?: (progressive: boolean) => void;
}

export type { CapacityUpgradesBlockProps };
