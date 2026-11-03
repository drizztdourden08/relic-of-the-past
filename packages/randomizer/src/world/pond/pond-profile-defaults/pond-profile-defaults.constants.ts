/* @layer shared-game @kind data */
import type { PondCustomSetting, PondSetting } from '../pond-profile.type';

const LEGACY_POND_SETTING: PondSetting = { mode: 'capacity' };

const DEFAULT_POND_ITEMS = 2;

const DEFAULT_POND_CUSTOM: PondCustomSetting = {
  mode: 'custom',
  start: 100,
  max: 300,
  throws: 7,
  items: DEFAULT_POND_ITEMS,
  shape: { curve: 'equal' },
};

const DEFAULT_POND_SETTING: PondSetting = {
  mode: 'custom',
  start: 0,
  max: 999,
  throws: 10,
  items: 10,
  shape: { curve: 'equal' },
};

export { DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, DEFAULT_POND_SETTING, LEGACY_POND_SETTING };
