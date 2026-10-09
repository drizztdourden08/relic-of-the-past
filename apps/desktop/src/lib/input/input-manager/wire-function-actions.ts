/* @layer renderer-lib @kind logic */
import { cheatSetHealth, cheatSetMaxHealth, cheatKillAllEnemies, cheatRefillMagic, cheatSetIgnoreCollision, getIgnoreCollisionEnabled } from '@rotp/game-core';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { getProfileId } from '@rotp/game-core';
import { setTurboHeld } from '@rotp/game-core';
import type { InputManager } from './input-manager';
import { FULL_HEALTH } from '@rotp/input-mapping';
import { cycleActiveProfile } from './cycle-active-profile';

const wireProfileActions = (m: InputManager): void => {
  m.functionActions.onAction('profile-next', () => cycleActiveProfile(m, 1));
  m.functionActions.onAction('profile-prev', () => cycleActiveProfile(m, -1));
};

const wireCheatActions = (m: InputManager): void => {
  m.functionActions.onAction('cheat-health', () => cheatSetHealth(FULL_HEALTH));
  m.functionActions.onAction('cheat-max-health', () => {
    cheatSetMaxHealth(FULL_HEALTH);
    cheatSetHealth(FULL_HEALTH);
  });
  m.functionActions.onAction('cheat-kill-enemies', () => cheatKillAllEnemies());
  m.functionActions.onAction('cheat-restore-magic', () => cheatRefillMagic());
  m.functionActions.onAction('cheat-ignore-collision', () => cheatSetIgnoreCollision(!getIgnoreCollisionEnabled()));
};

const wireDebugCaptureAction = (m: InputManager): void => {
  m.functionActions.onAction('toggle-debug-capture', () => {
    if (!liveSettingsNow()?.allowDebugLogging) return;
    const profileId = getProfileId();
    if (!profileId) return;
    useDebugCaptureStore.getState().toggle(profileId);
  });
};

const wireTurboAction = (m: InputManager): void => {
  m.functionActions.onAction('turbo', () => {
    if (!liveSettingsNow()?.turboEnabled) return;
    setTurboHeld(true);
  });
  m.functionActions.onKeyUp((action) => {
    if (action === 'turbo') setTurboHeld(false);
  });
  if (typeof window !== 'undefined') {
    window.addEventListener('blur', () => setTurboHeld(false));
  }
};

const wireFunctionActions = (m: InputManager): void => {
  wireProfileActions(m);
  wireCheatActions(m);
  wireDebugCaptureAction(m);
  wireTurboAction(m);
};

export { wireFunctionActions };
