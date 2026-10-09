/* @layer renderer-components @kind hook */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { usePlatform } from '@app/platform';
import { toast } from '@drizztdourden08/tessera/composites';
import { DEFAULT_SETTINGS, mergeSettings } from '../../../../../../lib/game/settings';
import { pushLiveSettings, LIVE_SETTINGS, getInputManager } from '../../../../../../lib/game';
import { DEFAULT_FUNCTION_MAPPINGS } from '@shared/types/controls';
import { log } from '../../../../../../lib/log-bus';
import type { ProfileHubProps } from '../ProfileHub.type';
import { readConfig } from '@app/lib/storage/profile-store';
import { applySettingsSideEffects } from './apply-settings-effects';
import { syncHudStore } from './sync-hud-store';
import { RESTART_TOAST_ID } from './settings-effects.constants';
import { syncDialogStore } from './sync-dialog-store';
import { syncTitleStore } from './sync-title-store';
import { setHudProfileId } from '@app/lib/hud/active-profile';
import { syncControlSettings } from '@app/stores/control-scheme-store';
import {
  ENHANCED_FALLBACK_EVENT, ENHANCED_FALLBACK_MESSAGE, ENHANCED_FALLBACK_TOAST_ID,
} from '@app/lib/game/enhanced-fallback';

const useProfileSettings = (props: ProfileHubProps) => {
  const {
    profile, isGameRunning, masterVolumeOverride,
    onWindowModeChange, onConstraintSettingsChange, onMasterVolumeChange, onDisplayPerfChange,
    onSaveSlotSettingsChange, onEdgeEffectChange, onShadowCastingChange, onPixelPerfectChange,
  } = props;

  const { window: win } = usePlatform();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const restartToastShownRef = useRef(false);
  const wasRunningRef = useRef(isGameRunning);
  const loadedRef = useRef(false);
  const pendingRef = useRef<Partial<GameSettings>>({});

  useEffect(() => {
    if (!wasRunningRef.current && isGameRunning) {
      pushLiveSettings(settings);
    }
    if (wasRunningRef.current && !isGameRunning) {
      restartToastShownRef.current = false;
      toast.dismiss(RESTART_TOAST_ID);
    }
    wasRunningRef.current = isGameRunning;
  }, [isGameRunning]);

  const handleSettingsChange = useCallback((patch: Partial<GameSettings>) => {
    if (!loadedRef.current) {
      pendingRef.current = { ...pendingRef.current, ...patch };
      return;
    }
    const changedKeys = Object.keys(patch) as (keyof GameSettings)[];
    const details = changedKeys.map((k) => `${k}=${JSON.stringify(patch[k])}`).join(', ');

    queueMicrotask(() => {
      log.app(`Settings changed: ${details}`);
      if (isGameRunning) {
        const liveKeys = changedKeys.filter((k) => LIVE_SETTINGS.has(k));
        const restartKeys = changedKeys.filter((k) => !LIVE_SETTINGS.has(k));
        if (liveKeys.length) log.app(`Live-updating: ${liveKeys.join(', ')}`);
        if (restartKeys.length) log.app(`Restart required for: ${restartKeys.join(', ')}`, 'warn');
      }
    });

    setSettings((prev) => {
      const next = { ...prev, ...patch };
      applySettingsSideEffects(patch, next, {
        profileId: profile.id, isGameRunning, changedKeys, restartToastShownRef,
        setFullscreen: win.setFullscreen,
        onWindowModeChange, onConstraintSettingsChange, onMasterVolumeChange, onDisplayPerfChange,
        onSaveSlotSettingsChange, onEdgeEffectChange, onShadowCastingChange, onPixelPerfectChange,
      });
      return next;
    });
  }, [profile.id, isGameRunning, win]);

  useEffect(() => {
    if (masterVolumeOverride != null) {
      handleSettingsChange({ masterVolume: masterVolumeOverride.volume });
    }
  }, [masterVolumeOverride?.version]);

  const handleRef = useRef(handleSettingsChange);
  handleRef.current = handleSettingsChange;

  useEffect(() => {
    setHudProfileId(profile.id);
    loadedRef.current = false;
    const flushPending = () => {
      loadedRef.current = true;
      const pending = pendingRef.current;
      pendingRef.current = {};
      if (Object.keys(pending).length > 0) handleRef.current(pending);
    };
    (async () => {
      try {
        const saved = await readConfig(profile.id);
        if (saved) {
          const merged = mergeSettings(saved);
          setSettings(merged);
          syncHudStore(merged);
          syncDialogStore(merged);
          syncTitleStore(merged);
          syncControlSettings(merged);
          onWindowModeChange?.(merged.windowMode);
          onConstraintSettingsChange?.(merged.viewportConstraint, merged.aspectRatio);
          onMasterVolumeChange?.(merged.masterVolume);
          onDisplayPerfChange?.(merged.displayPerfInTitle);
          onEdgeEffectChange?.(merged.overworldEdgeEffect);
          onShadowCastingChange?.(merged.postProcessingShadows);
          onPixelPerfectChange?.(merged.pixelPerfect);
          getInputManager().setFunctionMappings(merged.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
          pushLiveSettings(merged);
        }
      } catch {
        flushPending();
        return;
      }
      flushPending();
    })();
    return () => setHudProfileId(null);
  }, [profile.id]);

  useEffect(() => {
    const handler = (e: Event) => {
      const patch = (e as CustomEvent).detail as Partial<GameSettings>;
      if (patch) handleSettingsChange(patch);
    };
    window.addEventListener('settings:change', handler);
    return () => window.removeEventListener('settings:change', handler);
  }, [handleSettingsChange]);

  useEffect(() => {
    const handler = () => {
      handleSettingsChange({ hudStyle: 'vanilla' });
      toast({ id: ENHANCED_FALLBACK_TOAST_ID, message: ENHANCED_FALLBACK_MESSAGE, variant: 'danger', duration: 0 });
    };
    window.addEventListener(ENHANCED_FALLBACK_EVENT, handler);
    return () => window.removeEventListener(ENHANCED_FALLBACK_EVENT, handler);
  }, [handleSettingsChange]);

  return { settings, handleSettingsChange };
};

export { useProfileSettings };
