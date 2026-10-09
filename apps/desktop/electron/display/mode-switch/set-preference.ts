/* @layer electron-main @kind logic */
import { modeSwitchState } from './mode-switch-state';
import type { Preference } from './mode-switch.type';
import { restoreRate } from './restore-rate';

const setPreference = (next: Preference): void => {
  const wasEnabled = modeSwitchState.preference.enabled;
  modeSwitchState.preference = next;
  if (wasEnabled && !next.enabled) restoreRate();
};

export { setPreference };
