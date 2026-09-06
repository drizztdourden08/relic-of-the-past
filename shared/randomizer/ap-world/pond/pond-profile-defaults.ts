/* @layer shared-game @kind data */
/**
 * The pond's fixed settings. LEGACY is the mode every snapshot written
 * before the pond option means: the pond keeps its native purchase loop and
 * its two slots answer to the capacity families alone, byte for byte the
 * behaviour that shipped. DEFAULT is where a NEW profile starts: a Custom
 * pond that sells ten pool items from free up to four hundred over ten
 * throws. The Custom-shaped defaults under it are what a mode starts from
 * when the player picks it in the dropdown, never a stored value on their own.
 */
import { POND_PRICE_LADDER } from './pond-ladder.data';
import type { PondCustomSetting, PondSetting } from './pond-profile.type';

/** The pond as it has always behaved: an absent snapshot row means exactly this. */
const LEGACY_POND_SETTING: PondSetting = { mode: 'capacity' };

/** Today's two pond checks: what a mode offers before the player moves the slider. */
const DEFAULT_POND_ITEMS = 2;

/** Where a fresh Custom setting starts: a hundred up to three hundred over seven throws. */
const DEFAULT_POND_CUSTOM: PondCustomSetting = {
  mode: 'custom',
  start: 100,
  max: 300,
  throws: 7,
  items: DEFAULT_POND_ITEMS,
  shape: { curve: 'equal' },
};

/** Where a fresh profile starts: ten items, free to four hundred rupees, in ten equal steps. */
const DEFAULT_POND_SETTING: PondSetting = {
  mode: 'custom',
  start: 0,
  max: 400,
  throws: 10,
  items: 10,
  shape: { curve: 'equal' },
};

/** Lowest and highest price the range control offers. */
const POND_PRICE_FLOOR = POND_PRICE_LADDER[0];
const POND_PRICE_CEILING = POND_PRICE_LADDER[POND_PRICE_LADDER.length - 1];

export {
  DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, DEFAULT_POND_SETTING, LEGACY_POND_SETTING, POND_PRICE_CEILING,
  POND_PRICE_FLOOR,
};
