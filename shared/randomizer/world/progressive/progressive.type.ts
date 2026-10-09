/* @layer shared-game @kind types */
import type { ItemId } from '@rotp/game-data';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { OptionDetail } from '../option-description.type';

type ProgressiveFamilyId = 'sword' | 'shield' | 'mail' | 'glove' | 'bow' | 'ocarina';

type ProgressiveFamilyMode = 'progressive' | 'random';

type ProgressiveModeSetting = Readonly<Record<ProgressiveFamilyId, ProgressiveFamilyMode>>;

type ProgressiveTierTicks = readonly boolean[];

type ProgressiveSetting = Readonly<Record<ProgressiveFamilyId, ProgressiveTierTicks>>;

interface ProgressiveFamilyDef {
  id: ProgressiveFamilyId;
  label: string;
  poolItem: ItemId;
  tiers: readonly ItemId[];
  tierLabels: readonly string[];
  referenceCopies?: number;
  defaultTicks?: ProgressiveTierTicks;
}

type BladeCondition = 'noBlade' | 'noBeam';

interface TickConsequence {
  field: keyof ItemPowerSetting;
  when: BladeCondition;
  line: OptionDetail;
}

interface RequiredRung {
  family: ProgressiveFamilyId;
  from: number;
  why: string;
}

export type {
  BladeCondition, ProgressiveFamilyDef, ProgressiveFamilyId, ProgressiveFamilyMode, ProgressiveModeSetting,
  ProgressiveSetting, ProgressiveTierTicks, RequiredRung, TickConsequence,
};
