/* @layer electron-main @kind logic */
import { availableSyncedRates } from './available-synced-rates';
import { modeSwitchState } from './mode-switch-state';

const resolveTarget = (): number | null => {
  const options = availableSyncedRates();
  if (!options.length) return null;
  const { preference } = modeSwitchState;
  if (preference.targetHz > 0) {
    return options.includes(preference.targetHz) ? preference.targetHz : null;
  }
  return options[options.length - 1];
};

export { resolveTarget };
