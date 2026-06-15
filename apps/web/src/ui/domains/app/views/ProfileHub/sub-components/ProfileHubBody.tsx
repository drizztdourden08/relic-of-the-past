/* @layer renderer-components @kind component */
/** ProfileHub tab nav + active-tab content panel. */
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../design-system/primitives/Box';
import { NavRail } from '../../../../../design-system/composites/NavRail';
import { HomeTab } from './HomeTab';
import { SettingsView } from './SettingsView';
import { AudioSettings } from './AudioSettings';
import { GameplaySettings } from './GameplaySettings';
import { HudSettings } from './HudSettings';
import { ControlsSettings } from './ControlsSettings';
import { HapticsSettings } from './HapticsSettings';
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
  { id: 'settings', icon: '📺', label: 'Display' },
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
      <NavRail
        className="profile-hub__tabs"
        items={TABS}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as ProfileHubTab)}
      />

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
