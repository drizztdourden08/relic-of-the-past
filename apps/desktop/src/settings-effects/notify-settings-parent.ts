/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { SETTINGS_NOTIFIERS } from './settings-notifiers.constants';
import type { SettingsEffectDeps } from './settings-effects.type';

const notifySettingsParent = (patch: Partial<GameSettings>, next: GameSettings, deps: SettingsEffectDeps): void => {
  for (const notifier of SETTINGS_NOTIFIERS) {
    if (notifier.keys.some((key) => key in patch)) notifier.run(next, deps);
  }
};

export { notifySettingsParent };
