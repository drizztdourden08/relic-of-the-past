/* @layer tests @kind helper */
import { customSetting } from '@rotp/randomizer';
import type { FamilySetting } from '@rotp/randomizer';
import type { FamilyMode } from './capacity-pond-rule.type';

const settingFor = (mode: FamilyMode, start: number, max: number): FamilySetting =>
  (mode === 'custom' ? customSetting(start, max, 1) : { mode });

export { settingFor };
