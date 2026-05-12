import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Button } from '../../primitives/Button';
import { ToastContainer, type ToastItem } from '../../primitives/Toast';
import { HomeTab } from './tabs/HomeTab';
import { SettingsView } from './SettingsView';
import { AudioSettings } from './tabs/AudioSettings';
import { GameplaySettings } from './tabs/GameplaySettings';
import { ControlsSettings } from './tabs/ControlsSettings';
import { DEFAULT_SETTINGS, mergeSettings } from '../../../lib/game/settings';
import { pushLiveSettings, LIVE_SETTINGS } from '../../../lib/game';
import { log } from '../../../lib/log-bus';
import './ProfileHub.css';

function formatRelativeTime(ts: number): string {
  if (!ts) return 'Never';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString();
}

interface ProfileHubProps {
  profile: Profile;
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
  onWindowModeChange?: (mode: GameSettings['windowMode']) => void;
  onConstraintSettingsChange?: (constraint: GameSettings['viewportConstraint'], aspectRatio: GameSettings['aspectRatio']) => void;
  onMasterVolumeChange?: (volume: number) => void;
  onDisplayPerfChange?: (enabled: boolean) => void;
  masterVolumeOverride?: { volume: number; version: number } | null;
}

type TopTab = 'home' | 'settings' | 'audio' | 'gameplay' | 'controls';

export function ProfileHub({
  profile,
  isGameRunning,
  onStartGame,
  onStopGame,
  onResetGame,
  onWindowModeChange,
  onConstraintSettingsChange,
  onMasterVolumeChange,
  onDisplayPerfChange,
  masterVolumeOverride,
}: ProfileHubProps) {
  const [activeTab, setActiveTab] = useState<TopTab>('home');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const restartToastShownRef = useRef(false);
  const wasRunningRef = useRef(isGameRunning);

  // Clear restart toast when game stops (settings will apply on next start)
  useEffect(() => {
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
          onWindowModeChange?.(merged.windowMode);
          onConstraintSettingsChange?.(merged.viewportConstraint, merged.aspectRatio);
          onMasterVolumeChange?.(merged.masterVolume);
          onDisplayPerfChange?.(merged.displayPerfInTitle);
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
                <Button variant="danger" size="md" onClick={onStopGame}>■ Stop</Button>
                <Button variant="secondary" size="md" onClick={onResetGame}>↻ Reset</Button>
              </>
            )}
          </div>
        </div>
        <div className="profile-hub__info-cards">
          <div className="profile-hub__info-card">
            <span className="profile-hub__info-label">ROM</span>
            <span className="profile-hub__info-value">{profile.romFile.replace(/\.(sfc|smc)$/i, '')}</span>
          </div>
          <div className="profile-hub__info-card">
            <span className="profile-hub__info-label">Last Played</span>
            <span className="profile-hub__info-value">{formatRelativeTime(profile.lastPlayed)}</span>
          </div>
          <div className="profile-hub__info-card">
            <span className="profile-hub__info-label">Created</span>
            <span className="profile-hub__info-value">{formatRelativeTime(profile.created)}</span>
          </div>
          <div className="profile-hub__info-card">
            <span className="profile-hub__info-label">Window</span>
            <span className="profile-hub__info-value" style={{ textTransform: 'capitalize' }}>{settings.windowMode}</span>
          </div>
        </div>
      </div>

      {/* Tab cards */}
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
          className={`profile-hub__tab ${activeTab === 'controls' ? 'profile-hub__tab--active' : ''}`}
          onClick={() => setActiveTab('controls')}
        >
          <span className="profile-hub__tab-icon">⌨️</span>
          <span className="profile-hub__tab-label">Controls</span>
        </button>
      </div>

      {/* Content */}
      <div className="profile-hub__content">
        {activeTab === 'home' && (
          <HomeTab
            profileId={profile.id}
            romFile={profile.romFile}
            isGameRunning={isGameRunning}
            onStartGame={onStartGame}
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
        {activeTab === 'controls' && (
          <ControlsSettings settings={settings} onChange={handleSettingsChange} profileId={profile.id} />
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
