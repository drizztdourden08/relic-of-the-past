/* @layer electron-main @kind logic */
import { getDisplayModeDriver } from '../native';
import { modeSwitchState } from './mode-switch-state';
import { resolveTarget } from './resolve-target';
import { syncedRateMap } from './synced-rate-map';

const applyForFullscreen = (): void => {
  const driver = getDisplayModeDriver();
  modeSwitchState.lastError = '';
  if (!modeSwitchState.preference.enabled || !driver.available) return;

  const target = resolveTarget();
  if (target === null) {
    modeSwitchState.lastError = 'this display does not offer a refresh rate that is a multiple of 60';
    return;
  }
  const exactRate = syncedRateMap().get(target);
  if (exactRate === undefined) {
    modeSwitchState.lastError = `this display no longer offers ${target} Hz`;
    return;
  }

  const current = driver.currentRate();
  if (current === exactRate) return;

  if (!driver.setRate(exactRate)) {
    modeSwitchState.lastError = `the system refused to switch this display to ${target} Hz`;
    return;
  }
  if (modeSwitchState.rateToRestore === null && current !== null) modeSwitchState.rateToRestore = current;
};

export { applyForFullscreen };
