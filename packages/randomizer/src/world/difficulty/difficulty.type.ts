/* @layer shared-game @kind types */
import type { ProgressiveFamilyId } from '../progressive/progressive.type';

type CopyMultiplier = 1 | 2 | 3;

type CopyMultiplierSetting = Readonly<Record<ProgressiveFamilyId, CopyMultiplier>>;

interface DifficultySetting {
  copies: CopyMultiplierSetting;
  heartCap: number;
}

export type { CopyMultiplier, CopyMultiplierSetting, DifficultySetting };
