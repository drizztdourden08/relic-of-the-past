/* @layer renderer-components @kind component */
/** ProfileHub tab nav + active-tab content panel. */
import { useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../design-system/primitives/Box';
import { NavRail } from '../../../../../design-system/composites/NavRail';
import { HomeTab } from './HomeTab';
import { SettingsView } from './SettingsView';
import { GraphicsSettings } from './GraphicsSettings';
import { AudioSettings } from './AudioSettings';
import { GameplaySettings } from './GameplaySettings';
import { BugFixesSettings } from './BugFixesSettings';
import { HudSettings } from './HudSettings';
import { ControlsSettings } from './ControlsSettings';
import { HapticsSettings } from './HapticsSettings';
import { SystemSettings } from './SystemSettings';
import { MobileSettings } from './MobileSettings';
import { usePlatform } from '@app/platform';
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

const BASE_TABS: { id: ProfileHubTab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'settings', icon: '📺', label: 'Display' },
  { id: 'graphics', icon: '🎨', label: 'Graphics' },
  { id: 'audio', icon: '🔊', label: 'Audio' },
  { id: 'gameplay', icon: '🎮', label: 'Gameplay' },
  { id: 'bugfixes', icon: '🐛', label: 'Bug Fixes' },
  { id: 'hud', icon: '🖥️', label: 'HUD' },
  { id: 'controls', icon: '⌨️', label: 'Controls' },
  { id: 'haptics', icon: '📳', label: 'Haptics' },
  { id: 'system', icon: '⚙️', label: 'System' },
];

const MOBILE_TAB: { id: ProfileHubTab; icon: string; label: string } = { id: 'mobile', icon: '📱', label: 'Mobile' };

const ProfileHubBody = (props: ProfileHubBodyProps) => {
  const { activeTab, setActiveTab, settings, onChange, profile, isGameRunning, onStartGame } = props;
  const { info } = usePlatform();
  // Mobile options live in their own tab, always pinned to the very bottom — shown only on mobile.
  const tabs = useMemo(() => (info.formFactor === 'mobile' ? [...BASE_TABS, MOBILE_TAB] : BASE_TABS), [info.formFactor]);

  return (
    <Box className="profile-hub__body">
      <NavRail
        className="profile-hub__tabs"
        items={tabs}
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
        {activeTab === 'settings' && <SettingsView settings={settings} onChange={onChange} />}
        {activeTab === 'graphics' && <GraphicsSettings settings={settings} onChange={onChange} />}
        {activeTab === 'audio' && <AudioSettings settings={settings} onChange={onChange} />}
        {activeTab === 'gameplay' && <GameplaySettings settings={settings} onChange={onChange} />}
        {activeTab === 'bugfixes' && <BugFixesSettings settings={settings} onChange={onChange} />}
        {activeTab === 'hud' && <HudSettings settings={settings} onChange={onChange} />}
        {activeTab === 'controls' && (
          <ControlsSettings settings={settings} onChange={onChange} profileId={profile.id} />
        )}
        {activeTab === 'haptics' && <HapticsSettings settings={settings} onChange={onChange} />}
        {activeTab === 'system' && <SystemSettings settings={settings} onChange={onChange} />}
        {activeTab === 'mobile' && <MobileSettings settings={settings} onChange={onChange} />}
      </Box>
    </Box>
  );
};

export { ProfileHubBody };
