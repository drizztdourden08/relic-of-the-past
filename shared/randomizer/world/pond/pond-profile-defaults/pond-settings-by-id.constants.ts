/* @layer shared-game @kind constants */
import { pondRupeesOnlyAsk } from '../pond-ask.data';
import { DEFAULT_POND_SETTING } from './pond-profile-defaults.data';
import type { PondId } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';

const DEFAULT_WATERFALL_SETTING: PondSetting = {
  mode: 'custom',
  start: 0,
  max: 400,
  throws: 10,
  items: 10,
  shape: { curve: 'geometric' },
  ask: {
    ...pondRupeesOnlyAsk(0, 400),
    bombs: { enabled: true, min: 1, max: 10 },
    arrows: { enabled: true, min: 1, max: 20 },
    item: { enabled: true },
  },
};

const PYRAMID_BASE_ASK = pondRupeesOnlyAsk(100, 300);

const DEFAULT_PYRAMID_SETTING: PondSetting = {
  mode: 'custom',
  start: 100,
  max: 300,
  throws: 10,
  items: 10,
  shape: { curve: 'equal' },
  ask: {
    ...PYRAMID_BASE_ASK,
    rupees: { ...PYRAMID_BASE_ASK.rupees, enabled: false },
    bottle: { ...PYRAMID_BASE_ASK.bottle, enabled: true, min: 1, max: 2 },
    item: { enabled: true },
  },
};

const DEFAULT_SETTING_BY_ID: Readonly<Record<PondId, PondSetting>> = {
  capacity: DEFAULT_POND_SETTING,
  wishing: DEFAULT_WATERFALL_SETTING,
  cursed: DEFAULT_PYRAMID_SETTING,
};

export { DEFAULT_SETTING_BY_ID };
