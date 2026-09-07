/* @layer renderer-lib @kind logic */
/** Registers the debug-capture toggle as an ordinary function action, same mechanism as
 *  profile-next/profile-prev (input-manager-profiles.ts) - rebindable/clearable in Controls
 *  settings, never a hardcoded key listener. */
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { getProfileId } from '@app/lib/game/wasm-bridge';
import type { InputManager } from './input-manager';

const wireDebugCaptureAction = (m: InputManager): void => {
  m.functionActions.onAction('toggle-debug-capture', () => {
    if (!liveSettingsNow()?.allowDebugLogging) return;
    const profileId = getProfileId();
    if (!profileId) return;
    useDebugCaptureStore.getState().toggle(profileId);
  });
};

export { wireDebugCaptureAction };
