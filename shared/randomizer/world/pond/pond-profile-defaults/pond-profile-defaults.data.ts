/* @layer shared-game @kind data */
import { POND_PRICE_LADDER, POND_VANILLA_WALLET_TOP } from '../pond-ladder.data';
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

const DEFAULT_WISH_POND_SETTING: PondSetting = { mode: 'vanilla-cost', items: DEFAULT_POND_ITEMS };

const POND_PRICE_FLOOR = POND_PRICE_LADDER[0];
const POND_PRICE_CEILING = POND_VANILLA_WALLET_TOP;

export {
  DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, DEFAULT_POND_SETTING, DEFAULT_WISH_POND_SETTING, LEGACY_POND_SETTING,
  POND_PRICE_CEILING, POND_PRICE_FLOOR,
};
