/* @layer renderer-components @kind hook */
/** Settings load/persist/live-push, pause tracking, and restart toasts for ProfileHub. */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { usePlatform } from '@app/platform';
import type { ToastItem } from '../../../../../design-system/primitives/Toast';
import { DEFAULT_SETTINGS, mergeSettings } from '../../../../../../lib/game/settings';
import { pushLiveSettings, LIVE_SETTINGS, getInputManager } from '../../../../../../lib/game';
import { DEFAULT_FUNCTION_MAPPINGS } from '@shared/types/controls';
import { log } from '../../../../../../lib/log-bus';
import type { ProfileHubProps } from '../ProfileHub.type';
import { applySettingsSideEffects, syncHudStore } from './apply-settings-effects';

const useProfileSettings = (props: ProfileHubProps) => {
  const {
    profile, isGameRunning, masterVolumeOverride,
    onWindowModeChange, onConstraintSettingsChange, onMasterVolumeChange, onDisplayPerfChange,
    onSaveSlotSettingsChange, onEdgeEffectChange, onShadowCastingChange,
  } = props;

  const { window: win } = usePlatform();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const restartToastShownRef = useRef(false);
  const wasRunningRef = useRef(isGameRunning);
  const [gamePaused, setGamePaused] = useState(false);

  // Track pause state from InputManager
  useEffect(() => {
    if (!isGameRunning) {
      setGamePaused(false);
      return;
    }
    const inputMgr = getInputManager();
    setGamePaused(inputMgr.isPaused());
    const unsub = inputMgr.onPauseChange((paused) => setGamePaused(paused));
    return unsub;
  }, [isGameRunning]);

  const handleTogglePause = useCallback(() => {
    const inputMgr = getInputManager();
    if (inputMgr.isPaused()) {
      inputMgr.resume();
    } else {
      inputMgr.togglePause();
    }
  }, []);

  // Push live settings when game starts; clear restart toast when it stops.
  useEffect(() => {
    if (!wasRunningRef.current && isGameRunning) {
      pushLiveSettings(settings);
    }
    if (wasRunningRef.current && !isGameRunning) {
      restartToastShownRef.current = false;
      setToasts((prev) => prev.filter((t) => t.id !== 'restart-required'));
    }
    wasRunningRef.current = isGameRunning;
  }, [isGameRunning]);

  const handleSettingsChange = useCallback((patch: Partial<GameSettings>) => {
    const changedKeys = Object.keys(patch) as (keyof GameSettings)[];
    const details = changedKeys.map((k) => `${k}=${JSON.stringify(patch[k])}`).join(', ');

    // Log outside setSettings to avoid triggering setState in another component during render
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
        profileId: profile.id, isGameRunning, changedKeys, restartToastShownRef, setToasts,
        setFullscreen: win.setFullscreen,
        onWindowModeChange, onConstraintSettingsChange, onMasterVolumeChange, onDisplayPerfChange,
        onSaveSlotSettingsChange, onEdgeEffectChange, onShadowCastingChange,
      });
      return next;
    });
  }, [profile.id, isGameRunning, win]);

  // Apply master volume override from titlebar mute toggle
  useEffect(() => {
    if (masterVolumeOverride != null) {
      handleSettingsChange({ masterVolume: masterVolumeOverride.volume });
    }
  }, [masterVolumeOverride?.version]);

  // Load settings from disk on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await window.api.readConfig(profile.id);
        if (saved) {
          const merged = mergeSettings(saved);
          setSettings(merged);
          syncHudStore(merged);
          onWindowModeChange?.(merged.windowMode);
          onConstraintSettingsChange?.(merged.viewportConstraint, merged.aspectRatio);
          onMasterVolumeChange?.(merged.masterVolume);
          onDisplayPerfChange?.(merged.displayPerfInTitle);
          onEdgeEffectChange?.(merged.overworldEdgeEffect);
          onShadowCastingChange?.(merged.postProcessingShadows);
          getInputManager().setFunctionMappings(merged.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
          // Always attempt to push — if module isn't running yet, it's a no-op.
          pushLiveSettings(merged);
        }
      } catch { /* use defaults */ }
    })();
  }, [profile.id]);

  // Listen for external settings change requests (e.g. from debug widget)
  useEffect(() => {
    const handler = (e: Event) => {
      const patch = (e as CustomEvent).detail as Partial<GameSettings>;
      if (patch) handleSettingsChange(patch);
    };
    window.addEventListener('settings:change', handler);
    return () => window.removeEventListener('settings:change', handler);
  }, [handleSettingsChange]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { settings, handleSettingsChange, gamePaused, handleTogglePause, toasts, dismissToast };
};

export { useProfileSettings };
