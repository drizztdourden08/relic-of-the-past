/* @layer electron-main @kind logic */
import { getDisplayModeDriver } from '../native';
import { modeSwitchState } from './mode-switch-state';

const restoreRate = (): void => {
  if (modeSwitchState.rateToRestore === null) return;
  const target = modeSwitchState.rateToRestore;
  modeSwitchState.rateToRestore = null;
  getDisplayModeDriver().setRate(target);
};

export { restoreRate };
