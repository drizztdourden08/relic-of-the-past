/* @layer shared-game @kind data */
/**
 * The ponds' fixed settings. LEGACY is the mode every snapshot written
 * before the pond option means: a pond keeps its native purchase loop and
 * its two slots answer to their vanilla grants alone, byte for byte the
 * behaviour that shipped. DEFAULT is where a NEW profile starts: every pond on
 * a Custom ladder selling ten pool items over ten throws. Hylia Fairy asks for
 * rupees alone, free up to 999. Waterfall Fairy mixes rupees (free up to 400,
 * geometric), bombs, arrows and an item. Pyramid Fairy asks for bottles and an
 * item. The Custom-shaped defaults under it are what a
 * mode starts from when the player picks it in the dropdown, never a stored
 * value on their own.
 */
import { POND_IDS } from './pond-instances.data';
import { POND_PRICE_LADDER, POND_VANILLA_WALLET_TOP } from './pond-ladder.data';
import { pondRupeesOnlyAsk } from './pond-ask.data';
import type { PondId } from './pond-instance.type';
import type { PondCustomSetting, PondSetting } from './pond-profile.type';
import type { PondProfiles } from './pond-profiles.type';

/** A pond as it has always behaved: an absent snapshot row means exactly this. */
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

/** Where a fresh Hylia Fairy starts: ten items, free to 999 rupees, in ten equal steps. */
const DEFAULT_POND_SETTING: PondSetting = {
  mode: 'custom',
  start: 0,
  max: 999,
  throws: 10,
  items: 10,
  shape: { curve: 'equal' },
};

/** Where a fresh Waterfall Fairy starts: rupees on a geometric climb to 400, bombs, arrows or an item. */
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

/** Where a fresh Pyramid Fairy starts: one or two bottles, or an item. */
const DEFAULT_PYRAMID_SETTING: PondSetting = (() => {
  const base = pondRupeesOnlyAsk(100, 300);
  return {
    mode: 'custom',
    start: 100,
    max: 300,
    throws: 10,
    items: 10,
    shape: { curve: 'equal' },
    ask: {
      ...base,
      rupees: { ...base.rupees, enabled: false },
      bottle: { ...base.bottle, enabled: true, min: 1, max: 2 },
      item: { enabled: true },
    },
  };
})();

/** A fresh profile's setting per pond. */
const DEFAULT_SETTING_BY_ID: Readonly<Record<PondId, PondSetting>> = {
  capacity: DEFAULT_POND_SETTING,
  wishing: DEFAULT_WATERFALL_SETTING,
  cursed: DEFAULT_PYRAMID_SETTING,
};

/**
 * Where a fresh wish pond starts: its own two grants, at the price the
 * unmodified game charges for them, which is nothing.
 */
const DEFAULT_WISH_POND_SETTING: PondSetting = { mode: 'vanilla-cost', items: DEFAULT_POND_ITEMS };

const pondProfilesOf = (setting: (id: PondId) => PondSetting): PondProfiles =>
  Object.fromEntries(POND_IDS.map((id) => [id, setting(id)])) as PondProfiles;

/** Every pond as it has always behaved: what a snapshot with no pond row at all means. */
const LEGACY_POND_PROFILES: PondProfiles = pondProfilesOf(() => LEGACY_POND_SETTING);

/** Where a fresh profile starts, per pond. */
const DEFAULT_POND_PROFILES: PondProfiles = pondProfilesOf((id) => DEFAULT_SETTING_BY_ID[id]);

/** The setting a fresh profile gives one pond. */
const defaultPondSettingOf = (id: PondId): PondSetting => DEFAULT_POND_PROFILES[id];

/** Lowest price the range control offers, and the highest one under a vanilla wallet. */
const POND_PRICE_FLOOR = POND_PRICE_LADDER[0];
const POND_PRICE_CEILING = POND_VANILLA_WALLET_TOP;

export {
  DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, DEFAULT_POND_PROFILES, DEFAULT_POND_SETTING,
  DEFAULT_WISH_POND_SETTING, LEGACY_POND_PROFILES, LEGACY_POND_SETTING, POND_PRICE_CEILING,
  POND_PRICE_FLOOR, defaultPondSettingOf,
};
