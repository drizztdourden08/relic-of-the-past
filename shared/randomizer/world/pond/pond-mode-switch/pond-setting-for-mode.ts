/* @layer shared-game @kind logic */
import { DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, LEGACY_POND_SETTING } from '../pond-profile-defaults';
import type { PondMode, PondSetting } from '../pond-profile.type';

const pondSettingForMode = (mode: PondMode, current: PondSetting): PondSetting => {
  if (mode === current.mode) return current;
  if (mode === 'capacity') return LEGACY_POND_SETTING;
  const items = current.mode === 'capacity' ? DEFAULT_POND_ITEMS : current.items;
  return mode === 'custom' ? { ...DEFAULT_POND_CUSTOM, items } : { mode, items };
};

export { pondSettingForMode };
