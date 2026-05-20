import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Button } from '../../primitives/Button';
import { ToastContainer, type ToastItem } from '../../primitives/Toast';
import { HomeTab } from './tabs/HomeTab';
import { SettingsView } from './sub-components/SettingsView';
import { AudioSettings } from './tabs/AudioSettings';
import { GameplaySettings } from './tabs/GameplaySettings';
import { HudSettings } from './tabs/HudSettings';
import { ControlsSettings } from './tabs/ControlsSettings';
import { DEFAULT_SETTINGS, mergeSettings } from '../../../lib/game/settings';
import { pushLiveSettings, LIVE_SETTINGS, getInputManager } from '../../../lib/game';
import { useHudSettingsStore } from '../../../stores/hud-settings-store';
import { DEFAULT_FUNCTION_MAPPINGS } from '@shared/types/controls';
import { log } from '../../../lib/log-bus';
import './ProfileHub.css';
import type { ProfileHubProps, ProfileHubTab } from './types';


const ProfileHub = (props: ProfileHubProps) => {
  const {
    profile,
    isGameRunning,
    onStartGame,
    onStopGame,
    onResetGame,
    onWindowModeChange,
    onConstraintSettingsChange,
    onMasterVolumeChange,
    onDisplayPerfChange,
    onSaveSlotSettingsChange,
    onEdgeEffectChange,
    masterVolumeOverride,
    activeTab: controlledTab,
    onTabChange,
  } = props;
  const [internalTab, setInternalTab] = useState<ProfileHubTab>('home');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: ProfileHubTab) => { onTabChange?.(tab); setInternalTab(tab); };
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

  // Clear restart toast when game stops (settings will apply on next start)
  // Push live settings when game starts (for flags not in INI like forceBackdropBlack)
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
          useHudSettingsStore.getState().setHudSettings({
            mode: merged.hudMode,
            style: merged.hudStyle,
            ratio: merged.hudRatio,
            heartMode: merged.hudHeartMode,
            magicMode: merged.hudMagicMode,
            countLayout: merged.hudCountLayout,
          });
          onWindowModeChange?.(merged.windowMode);
          onConstraintSettingsChange?.(merged.viewportConstraint, merged.aspectRatio);
          onMasterVolumeChange?.(merged.masterVolume);
          onDisplayPerfChange?.(merged.displayPerfInTitle);
          onEdgeEffectChange?.(merged.overworldEdgeEffect);
          getInputManager().setFunctionMappings(merged.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
          if (isGameRunning) pushLiveSettings(merged);
        }
      } catch { /* use defaults */ }
    })();
  }, [profile.id]);

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
      // Persist asynchronously — fire and forget
      window.api.writeConfig(profile.id, next).catch(() => {});

      // Notify parent of window mode changes
      if ('windowMode' in patch) {
        onWindowModeChange?.(next.windowMode);
      }

      // Apply fullscreen immediately when toggled
      if ('startFullscreen' in patch) {
        window.api.setFullscreen(!!next.startFullscreen);
      }

      // Notify parent of constraint-relevant settings changes
      if ('viewportConstraint' in patch || 'aspectRatio' in patch) {
        onConstraintSettingsChange?.(next.viewportConstraint, next.aspectRatio);
      }

      // Notify parent of volume/perf display changes (for titlebar sync)
      if ('masterVolume' in patch) {
        onMasterVolumeChange?.(next.masterVolume);
      }
      if ('displayPerfInTitle' in patch) {
        onDisplayPerfChange?.(next.displayPerfInTitle);
      }

      // Push function mappings to InputManager when changed
      if ('functionMappings' in patch) {
        getInputManager().setFunctionMappings(next.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
      }

      // Notify parent of save slot settings changes
      if ('enhancedSaveSlotShortcut' in patch || 'saveHoldDuration' in patch) {
        onSaveSlotSettingsChange?.(next.enhancedSaveSlotShortcut, next.saveHoldDuration);
      }

      // Notify parent of edge effect toggle
      if ('overworldEdgeEffect' in patch) {
        onEdgeEffectChange?.(next.overworldEdgeEffect);
      }

      // Sync HUD settings to store for live rendering
      if ('hudMode' in patch || 'hudStyle' in patch || 'hudRatio' in patch || 'hudHeartMode' in patch || 'hudMagicMode' in patch || 'hudCountLayout' in patch) {
        useHudSettingsStore.getState().setHudSettings({
          mode: next.hudMode,
          style: next.hudStyle,
          ratio: next.hudRatio,
          heartMode: next.hudHeartMode,
          magicMode: next.hudMagicMode,
          countLayout: next.hudCountLayout,
        });
      }

      // If game is running, push live settings and maybe show restart toast
      if (isGameRunning) {
        pushLiveSettings(next);
        const restartKeys = changedKeys.filter((k) => !LIVE_SETTINGS.has(k));
        if (restartKeys.length > 0 && !restartToastShownRef.current) {
          restartToastShownRef.current = true;
          setToasts((prev) => [
            ...prev.filter((t) => t.id !== 'restart-required'),
            {
              id: 'restart-required',
              message: 'Some changes require a game restart to take effect',
              variant: 'danger' as const,
            },
          ]);
        }
      }

      return next;
    });
  }, [profile.id, isGameRunning]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="profile-hub">
      {/* Profile Header — always visible */}
      <div className="profile-hub__header">
        <div className="profile-hub__title-row">
          <h1 className="profile-hub__name">{profile.name}</h1>
          <div className="profile-hub__actions">
            {!isGameRunning ? (
              <Button variant="primary" size="md" onClick={onStartGame}>▶ Play</Button>
            ) : (
              <>
                <Button variant="secondary" size="md" onClick={handleTogglePause}>
                  {gamePaused ? '▶ Resume' : '⏸ Pause'}
                </Button>
                <Button variant="danger" size="md" onClick={onStopGame}>■ Stop</Button>
                <Button variant="secondary" size="md" onClick={onResetGame}>↻ Reset</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body: left tabs + content */}
      <div className="profile-hub__body">
        <div className="profile-hub__tabs">
          <button
            className={`profile-hub__tab ${activeTab === 'home' ? 'profile-hub__tab--active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span className="profile-hub__tab-icon">🏠</span>
            <span className="profile-hub__tab-label">Home</span>
          </button>
          <button
            className={`profile-hub__tab ${activeTab === 'settings' ? 'profile-hub__tab--active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="profile-hub__tab-icon">⚙️</span>
            <span className="profile-hub__tab-label">Settings</span>
          </button>
          <button
            className={`profile-hub__tab ${activeTab === 'audio' ? 'profile-hub__tab--active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            <span className="profile-hub__tab-icon">🔊</span>
            <span className="profile-hub__tab-label">Audio</span>
          </button>
          <button
            className={`profile-hub__tab ${activeTab === 'gameplay' ? 'profile-hub__tab--active' : ''}`}
            onClick={() => setActiveTab('gameplay')}
          >
            <span className="profile-hub__tab-icon">🎮</span>
            <span className="profile-hub__tab-label">Gameplay</span>
          </button>
          <button
            className={`profile-hub__tab ${activeTab === 'hud' ? 'profile-hub__tab--active' : ''}`}
            onClick={() => setActiveTab('hud')}
          >
            <span className="profile-hub__tab-icon">🖥️</span>
            <span className="profile-hub__tab-label">HUD</span>
          </button>
          <button
            className={`profile-hub__tab ${activeTab === 'controls' ? 'profile-hub__tab--active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            <span className="profile-hub__tab-icon">⌨️</span>
            <span className="profile-hub__tab-label">Controls</span>
          </button>
        </div>

        <div className="profile-hub__content">
          {activeTab === 'home' && (
            <HomeTab
              profileId={profile.id}
              romFile={profile.romFile}
              isGameRunning={isGameRunning}
              onStartGame={onStartGame}
              lastPlayed={profile.lastPlayed}
              created={profile.created}
              windowMode={settings.windowMode}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView settings={settings} onChange={handleSettingsChange} />
          )}
          {activeTab === 'audio' && (
            <AudioSettings profileId={profile.id} settings={settings} onChange={handleSettingsChange} />
          )}
          {activeTab === 'gameplay' && (
            <GameplaySettings settings={settings} onChange={handleSettingsChange} />
          )}
          {activeTab === 'hud' && (
            <HudSettings settings={settings} onChange={handleSettingsChange} />
          )}
          {activeTab === 'controls' && (
            <ControlsSettings settings={settings} onChange={handleSettingsChange} profileId={profile.id} />
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export { ProfileHub };
