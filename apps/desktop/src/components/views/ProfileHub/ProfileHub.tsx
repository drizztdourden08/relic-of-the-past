import { useState, useCallback, useEffect } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { TabBar } from '../../primitives/TabBar';
import { HomeTab } from './tabs/HomeTab';
import { GameplaySettings } from './tabs/GameplaySettings';
import { GraphicsSettings } from './tabs/GraphicsSettings';
import { AudioSettings } from './tabs/AudioSettings';
import { ControlsSettings } from './tabs/ControlsSettings';
import { DEFAULT_SETTINGS, mergeSettings } from '../../../lib/game/settings';
import './ProfileHub.css';

interface ProfileHubProps {
  profile: Profile;
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
}

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'gameplay', label: 'Gameplay', icon: '🎮' },
  { id: 'graphics', label: 'Graphics', icon: '🖥' },
  { id: 'audio', label: 'Audio', icon: '🔊' },
  { id: 'controls', label: 'Controls', icon: '⌨' },
];

export function ProfileHub({
  profile,
  isGameRunning,
  onStartGame,
  onStopGame,
  onResetGame,
}: ProfileHubProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Load settings from disk on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await window.api.readConfig(profile.id);
        if (saved) setSettings(mergeSettings(saved));
      } catch { /* use defaults */ }
    })();
  }, [profile.id]);

  const handleSettingsChange = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      // Persist asynchronously — fire and forget
      window.api.writeConfig(profile.id, next).catch(() => {});
      return next;
    });
  }, [profile.id]);

  return (
    <div className="profile-hub">
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="profile-hub__content">
        {activeTab === 'home' && (
          <HomeTab
            profileId={profile.id}
            profileName={profile.name}
            romFile={profile.romFile}
            isGameRunning={isGameRunning}
            onStartGame={onStartGame}
            onStopGame={onStopGame}
            onResetGame={onResetGame}
          />
        )}
        {activeTab === 'gameplay' && (
          <GameplaySettings settings={settings} onChange={handleSettingsChange} />
        )}
        {activeTab === 'graphics' && (
          <GraphicsSettings settings={settings} onChange={handleSettingsChange} />
        )}
        {activeTab === 'audio' && (
          <AudioSettings settings={settings} onChange={handleSettingsChange} />
        )}
        {activeTab === 'controls' && (
          <ControlsSettings />
        )}
      </div>
    </div>
  );
}
