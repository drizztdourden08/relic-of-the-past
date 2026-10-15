/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { pushLiveSettings } from '@app/game';
import { enhancedAspectAllowed, requestEnhancedFallback } from '@rotp/game-core';
import { hostDrawnHud } from '@rotp/features';
import { notifySettingsParent } from './notify-settings-parent';
import { ASPECT_KEYS } from './settings-effects.constants';
import { syncStoresForPatch } from './sync-stores-for-patch';
import { warnRestartNeeded } from './warn-restart-needed';
import type { SettingsEffectDeps } from './settings-effects.type';

const applySettingsSideEffects = (patch: Partial<GameSettings>, next: GameSettings, deps: SettingsEffectDeps): void => {
  notifySettingsParent(patch, next, deps);
  syncStoresForPatch(patch, next);

  if (ASPECT_KEYS.some((k) => k in patch) && !enhancedAspectAllowed(next) && hostDrawnHud(next.hudStyle)) {
    queueMicrotask(requestEnhancedFallback);
  }

  if (deps.isGameRunning) {
    pushLiveSettings(next);
    warnRestartNeeded(deps);
  }
};

export { applySettingsSideEffects };
