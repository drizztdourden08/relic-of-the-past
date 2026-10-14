/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { usePlatform, useProfilesStore, useSettingsStore } from '@drizztdourden08/brock-react';
import { toast } from '@drizztdourden08/tessera/composites';
import type { GameSettings } from '@rotp/features';
import { pushLiveSettings, LIVE_SETTINGS } from '@app/game';
import { log } from '@app/log-bus';
import { setHudProfileId } from '@app/hud/active-profile';
import { applySettingsSideEffects } from '@app/settings-effects/apply-settings-effects';
import { RESTART_TOAST_ID } from '@app/settings-effects/settings-effects.constants';
import type { SettingsBridgeDeps } from '@app/settings-effects/settings-effects.type';
import type { AppSettings } from '@app/settings.type';
import { pushHydratedSettings } from './push-hydrated-settings';
import { useSettingsWindowEvents } from './useSettingsWindowEvents';

const announce = (patch: Partial<GameSettings>, isGameRunning: boolean): void => {
  const changedKeys = Object.keys(patch) as (keyof GameSettings)[];
  log.app(`Settings changed: ${changedKeys.map((k) => `${k}=${JSON.stringify(patch[k])}`).join(', ')}`);
  if (!isGameRunning) return;
  const liveKeys = changedKeys.filter((k) => LIVE_SETTINGS.has(k));
  const restartKeys = changedKeys.filter((k) => !LIVE_SETTINGS.has(k));
  if (liveKeys.length) log.app(`Live-updating: ${liveKeys.join(', ')}`);
  if (restartKeys.length) log.app(`Restart required for: ${restartKeys.join(', ')}`, 'warn');
};

const useSettingsBridge = (deps: SettingsBridgeDeps): void => {
  const { isGameRunning, masterVolumeOverride } = deps;
  const store = useSettingsStore<AppSettings>();
  const hydrated = store((s) => s.hydrated);
  const profileId = useProfilesStore((s) => s.active?.id ?? null);
  const { window: win } = usePlatform();
  const depsRef = useRef(deps);
  depsRef.current = deps;
  const restartToastShownRef = useRef(false);
  const wasRunningRef = useRef(isGameRunning);

  useEffect(() => {
    setHudProfileId(profileId);
    return () => setHudProfileId(null);
  }, [profileId]);

  useEffect(() => {
    if (!hydrated || profileId === null) return;
    pushHydratedSettings(store.getState().settings, depsRef.current.callbacks);
  }, [hydrated, profileId, store]);

  useEffect(() => store.addEffect((patch, next) => {
    const id = useProfilesStore.getState().active?.id;
    if (!id) return;
    const { isGameRunning: running, callbacks } = depsRef.current;
    queueMicrotask(() => announce(patch, running));
    applySettingsSideEffects(patch, next, {
      ...callbacks,
      profileId: id,
      isGameRunning: running,
      changedKeys: Object.keys(patch) as (keyof GameSettings)[],
      restartToastShownRef,
      setFullscreen: win.setFullscreen,
    });
  }), [store, win]);

  useEffect(() => {
    if (!wasRunningRef.current && isGameRunning) pushLiveSettings(store.getState().settings);
    if (wasRunningRef.current && !isGameRunning) {
      restartToastShownRef.current = false;
      toast.dismiss(RESTART_TOAST_ID);
    }
    wasRunningRef.current = isGameRunning;
  }, [isGameRunning, store]);

  useEffect(() => {
    if (masterVolumeOverride != null) store.getState().patch({ masterVolume: masterVolumeOverride.volume });
  }, [masterVolumeOverride?.version, store]);

  useSettingsWindowEvents(store);
};

export { useSettingsBridge };
