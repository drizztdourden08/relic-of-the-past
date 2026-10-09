/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { pushLiveSettings, LIVE_SETTINGS } from '../../../../../../lib/game';
import { writeConfig } from '../../../../../../lib/storage/profile-store';
import { enhancedAspectAllowed } from '../../../../../../lib/game/settings';
import { requestEnhancedFallback } from '@app/lib/game/enhanced-fallback';
import { hostDrawnHud } from '@shared/features/hud-style';
import { syncControlSettings } from '@app/stores/control-scheme-store';
import { syncDialogStore } from './sync-dialog-store';
import { touchesDialogStore } from './touches-dialog-store';
import { syncTitleStore } from './sync-title-store';
import { touchesTitleStore } from './touches-title-store';
import { syncHudStore } from './sync-hud-store';
import { swapPlayerSprite } from './swap-player-sprite';
import { notifySettingsParent } from './notify-settings-parent';
import {
  ASPECT_KEYS, CONFIG_SAVE_FAILED_TOAST_ID, CONTROL_STORE_KEYS, HUD_STORE_KEYS, RESTART_TOAST_ID,
} from './settings-effects.constants';
import type { SettingsEffectDeps } from './settings-effects.type';

const applySettingsSideEffects = (patch: Partial<GameSettings>, next: GameSettings, deps: SettingsEffectDeps): void => {
  const { profileId, isGameRunning, changedKeys, restartToastShownRef, setToasts } = deps;

  writeConfig(profileId, { ...next }).catch((e: unknown) => {
    console.error('[settings] failed to persist config', e);
    setToasts((prev) => [
      ...prev.filter((t) => t.id !== CONFIG_SAVE_FAILED_TOAST_ID),
      { id: CONFIG_SAVE_FAILED_TOAST_ID, message: 'Failed to save settings', variant: 'danger' as const },
    ]);
  });

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
      setToasts((prev) => [
        ...prev.filter((t) => t.id !== RESTART_TOAST_ID),
        {
          id: RESTART_TOAST_ID,
          message: 'Some changes require a game restart to take effect',
          variant: 'danger' as const,
        },
      ]);
    }
  }
};

export { applySettingsSideEffects };
export type { SettingsEffectDeps };
