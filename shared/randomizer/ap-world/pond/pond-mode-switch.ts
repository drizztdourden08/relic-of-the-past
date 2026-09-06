/* @layer shared-game @kind logic */
/**
 * The setting a pond MODE change lands on. Picking a mode says nothing about
 * the prices or the item count it should carry, so this is where that is
 * decided, once: the legacy mode drops every value row, the other three keep
 * the item count the player already chose (or the default, coming from the
 * legacy pond, which carries none of its own) and Custom starts from the
 * fresh price ladder. Shared by the options panel and by the rule that
 * forces the pond off the legacy mode, so a forced switch lands exactly
 * where a hand-picked one does.
 */
import { DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, LEGACY_POND_SETTING } from './pond-profile-defaults';
import type { PondMode, PondSetting } from './pond-profile.type';

/** Every mode the pond offers, in the order the dropdown lists them. */
const POND_MODES: readonly PondMode[] = ['capacity', 'vanilla-cost', 'custom', 'gamble'];

const pondSettingForMode = (mode: PondMode, current: PondSetting): PondSetting => {
  if (mode === current.mode) return current;
  if (mode === 'capacity') return LEGACY_POND_SETTING;
  const items = current.mode === 'capacity' ? DEFAULT_POND_ITEMS : current.items;
  return mode === 'custom' ? { ...DEFAULT_POND_CUSTOM, items } : { mode, items };
};

export { POND_MODES, pondSettingForMode };
