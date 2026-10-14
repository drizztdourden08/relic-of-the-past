/* @layer renderer-components @kind logic */
import { toast } from '@drizztdourden08/tessera/composites';
import { LIVE_SETTINGS } from '@app/game';
import { RESTART_TOAST_ID } from './settings-effects.constants';
import type { SettingsEffectDeps } from './settings-effects.type';

const warnRestartNeeded = (deps: SettingsEffectDeps): void => {
  const { changedKeys, restartToastShownRef } = deps;
  const restartKeys = changedKeys.filter((k) => !LIVE_SETTINGS.has(k));
  if (restartKeys.length > 0 && !restartToastShownRef.current) {
    restartToastShownRef.current = true;
    toast({
      id: RESTART_TOAST_ID,
      message: 'Some changes require a game restart to take effect',
      variant: 'danger',
      duration: 0,
    });
  }
};

export { warnRestartNeeded };
