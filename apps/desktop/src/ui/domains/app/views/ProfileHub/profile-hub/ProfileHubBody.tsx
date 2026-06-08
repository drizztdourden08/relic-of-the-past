/* @layer renderer-components @kind component */
/** ProfileHub tab nav + active-tab content panel. */
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { HomeTab } from '../tabs/HomeTab';
import { SettingsView } from '../sub-components/SettingsView';
import { AudioSettings } from '../tabs/AudioSettings';
import { GameplaySettings } from '../tabs/GameplaySettings';
import { HudSettings } from '../tabs/HudSettings';
import { ControlsSettings } from '../tabs/ControlsSettings';
import { HapticsSettings } from '../tabs/HapticsSettings';
import type { ProfileHubProps, ProfileHubTab } from '../ProfileHub.type';

interface ProfileHubBodyProps {
  activeTab: ProfileHubTab;
  setActiveTab: (t: ProfileHubTab) => void;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profile: ProfileHubProps['profile'];
  isGameRunning: boolean;
  onStartGame: () => void;
}

const TABS: { id: ProfileHubTab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'audio', icon: '🔊', label: 'Audio' },
  { id: 'gameplay', icon: '🎮', label: 'Gameplay' },
  { id: 'hud', icon: '🖥️', label: 'HUD' },
  { id: 'controls', icon: '⌨️', label: 'Controls' },
  { id: 'haptics', icon: '📳', label: 'Haptics' },
];

const ProfileHubBody = (props: ProfileHubBodyProps) => {
  const { activeTab, setActiveTab, settings, onChange, profile, isGameRunning, onStartGame } = props;
  return (
    <Box className="profile-hub__body">
      <Box className="profile-hub__tabs">
        {TABS.map((t) => (
          <Box
            as="button"
            key={t.id}
            className={`profile-hub__tab ${activeTab === t.id ? 'profile-hub__tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <Text className="profile-hub__tab-icon">{t.icon}</Text>
            <Text className="profile-hub__tab-label">{t.label}</Text>
          </Box>
        ))}
      </Box>

      <Box className="profile-hub__content">
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
          <SettingsView settings={settings} onChange={onChange} />
        )}
        {activeTab === 'audio' && (
          <AudioSettings profileId={profile.id} settings={settings} onChange={onChange} />
        )}
        {activeTab === 'gameplay' && (
          <GameplaySettings settings={settings} onChange={onChange} />
        )}
        {activeTab === 'hud' && (
          <HudSettings settings={settings} onChange={onChange} />
        )}
        {activeTab === 'controls' && (
          <ControlsSettings settings={settings} onChange={onChange} profileId={profile.id} />
        )}
        {activeTab === 'haptics' && (
          <HapticsSettings settings={settings} onChange={onChange} />
        )}
      </Box>
    </Box>
  );
};

export { ProfileHubBody };
