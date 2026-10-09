/* @layer tests @kind helper */
import { customSetting } from '@shared/randomizer/world/capacity';
import type { FamilySetting } from '@shared/randomizer/world/capacity';
import type { FamilyMode } from './capacity-pond-rule.type';

const settingFor = (mode: FamilyMode, start: number, max: number): FamilySetting =>
  (mode === 'custom' ? customSetting(start, max, 1) : { mode });

export { settingFor };
