/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { toast } from '@drizztdourden08/tessera/composites';
import { pushLiveSettings, LIVE_SETTINGS } from '@app/game';
import { enhancedAspectAllowed } from '@rotp/game-core';
import { requestEnhancedFallback } from '@rotp/game-core';
import { hostDrawnHud } from '@rotp/features';
import { syncControlSettings } from '@app/stores/control-scheme-store';
import { syncDialogStore } from './sync-dialog-store';
import { touchesDialogStore } from './touches-dialog-store';
import { syncTitleStore } from './sync-title-store';
import { touchesTitleStore } from './touches-title-store';
import { syncHudStore } from './sync-hud-store';
import { swapPlayerSprite } from './swap-player-sprite';
import { notifySettingsParent } from './notify-settings-parent';
import {
  ASPECT_KEYS, CONTROL_STORE_KEYS, HUD_STORE_KEYS, RESTART_TOAST_ID,
} from './settings-effects.constants';
import type { SettingsEffectDeps } from './settings-effects.type';

const applySettingsSideEffects = (patch: Partial<GameSettings>, next: GameSettings, deps: SettingsEffectDeps): void => {
  const { isGameRunning, changedKeys, restartToastShownRef } = deps;

  notifySettingsParent(patch, next, deps);

  if ('linkSprite' in patch) {
    void swapPlayerSprite(next.linkSprite);
  }

  if (HUD_STORE_KEYS.some((k) => k in patch)) {
    syncHudStore(next);
  }
  if (touchesDialogStore(patch)) {
    syncDialogStore(next);
  }
  if (touchesTitleStore(patch)) {
    syncTitleStore(next);
  }

  if (CONTROL_STORE_KEYS.some((k) => k in patch)) syncControlSettings(next);

  if (ASPECT_KEYS.some((k) => k in patch) && !enhancedAspectAllowed(next) && hostDrawnHud(next.hudStyle)) {
    queueMicrotask(requestEnhancedFallback);
  }

  if (isGameRunning) {
    pushLiveSettings(next);
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
  }
};

export { applySettingsSideEffects };
export type { SettingsEffectDeps };
