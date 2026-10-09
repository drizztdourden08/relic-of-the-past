/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { usePlatform, useProfilesStore, useSettingsStore } from '@drizztdourden08/brock-react';
import { toast } from '@drizztdourden08/tessera/composites';
import { DEFAULT_FUNCTION_MAPPINGS } from '@rotp/features';
import type { GameSettings } from '@rotp/features';
import { getInputManager, pushLiveSettings, LIVE_SETTINGS } from '@app/lib/game';
import { mergeSettings } from '@app/lib/game/settings';
import { log } from '@app/lib/log-bus';
import { setHudProfileId } from '@app/lib/hud/active-profile';
import { syncControlSettings } from '@app/stores/control-scheme-store';
import { ENHANCED_FALLBACK_EVENT, ENHANCED_FALLBACK_MESSAGE, ENHANCED_FALLBACK_TOAST_ID } from '@app/lib/game/enhanced-fallback';
import { applySettingsSideEffects } from '@app/settings-effects/apply-settings-effects';
import { RESTART_TOAST_ID } from '@app/settings-effects/settings-effects.constants';
import { syncHudStore } from '@app/settings-effects/sync-hud-store';
import { syncDialogStore } from '@app/settings-effects/sync-dialog-store';
import { syncTitleStore } from '@app/settings-effects/sync-title-store';
import type { SettingsBridgeDeps } from '@app/settings-effects/settings-effects.type';
import type { AppSettings } from '@app/settings.type';

const normalisationPatch = (current: AppSettings): Partial<AppSettings> => {
  const merged = mergeSettings(current) as AppSettings;
  return Object.fromEntries(
    Object.entries(merged).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(Reflect.get(current, key))),
  ) as Partial<AppSettings>;
};

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
    const fix = normalisationPatch(store.getState().settings);
    if (Object.keys(fix).length > 0) store.getState().patch(fix);
    const merged = store.getState().settings;
    const { callbacks } = depsRef.current;
    syncHudStore(merged);
    syncDialogStore(merged);
    syncTitleStore(merged);
    syncControlSettings(merged);
    callbacks.onWindowModeChange?.(merged.windowMode);
    callbacks.onConstraintSettingsChange?.(merged.viewportConstraint, merged.aspectRatio);
    callbacks.onMasterVolumeChange?.(merged.masterVolume);
    callbacks.onDisplayPerfChange?.(merged.displayPerfInTitle);
    callbacks.onEdgeEffectChange?.(merged.overworldEdgeEffect);
    callbacks.onShadowCastingChange?.(merged.postProcessingShadows);
    callbacks.onPixelPerfectChange?.(merged.pixelPerfect);
    getInputManager().setFunctionMappings(merged.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
    pushLiveSettings(merged);
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

  useEffect(() => {
    const onChange = (event: Event) => {
      const patch = (event as CustomEvent).detail as Partial<AppSettings> | undefined;
      if (patch) store.getState().patch(patch);
    };
    const onFallback = () => {
      store.getState().patch({ hudStyle: 'vanilla' });
      toast({ id: ENHANCED_FALLBACK_TOAST_ID, message: ENHANCED_FALLBACK_MESSAGE, variant: 'danger', duration: 0 });
    };
    window.addEventListener('settings:change', onChange);
    window.addEventListener(ENHANCED_FALLBACK_EVENT, onFallback);
    return () => {
      window.removeEventListener('settings:change', onChange);
      window.removeEventListener(ENHANCED_FALLBACK_EVENT, onFallback);
    };
  }, [store]);
};

export { useSettingsBridge };
