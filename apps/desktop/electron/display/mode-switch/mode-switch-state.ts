/* @layer electron-main @kind logic */
import type { Preference } from './mode-switch.type';

const modeSwitchState = {
  preference: { enabled: false, targetHz: 0 } as Preference,
  rateToRestore: null as number | null,
  lastError: '',
};

export { modeSwitchState };
