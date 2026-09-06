/* @layer renderer-components @kind component */
/** ProfileHub tab nav + active-tab content panel. */
import { useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../design-system/primitives/Box';
import { NavRail } from '../../../../../design-system/composites/NavRail';
import { RandomizerLockContext } from '../../../compounds/SettingsLayout';
import { HomeTab } from './HomeTab';
import { SettingsView } from './SettingsView';
import { GraphicsSettings } from './GraphicsSettings';
import { AudioSettings } from './AudioSettings';
import { GameplaySettings } from './GameplaySettings';
import { BugFixesSettings } from './BugFixesSettings';
import { HudSettings } from './HudSettings';
import { ControlsSettings } from './ControlsSettings';
import { HapticsSettings } from './HapticsSettings';
import { DeveloperSettings } from './DeveloperSettings';
import { MobileSettings } from './MobileSettings';
import { usePlatform } from '@app/platform';
import { PROFILE_HUB_TABS } from '../ProfileHub.constants';
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

const ProfileHubBody = (props: ProfileHubBodyProps) => {
  const { activeTab, setActiveTab, settings, onChange, profile, isGameRunning, onStartGame } = props;
  const { info } = usePlatform();
  // Mobile options live in their own tab, always pinned to the very bottom, and shown only on mobile.
  const tabs = useMemo(
    () => (Object.entries(PROFILE_HUB_TABS) as [ProfileHubTab, typeof PROFILE_HUB_TABS[ProfileHubTab]][])
      .filter(([, spec]) => !spec.mobileOnly || info.formFactor === 'mobile')
      .map(([id, spec]) => ({ id, icon: spec.icon, label: spec.label })),
    [info.formFactor],
  );

  // Keys the profile's randomizer config pins; SettingsLayout locks these controls.
  const randomizerFrozenKeys = useMemo(
    () => Object.keys(profile.randomizer?.frozenSettings ?? {}),
    [profile.randomizer],
  );

  return (
    <RandomizerLockContext.Provider value={randomizerFrozenKeys}>
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
              randomizer={profile.randomizer}
              vanillaSafe={settings.vanillaSafe}
            />
          )}
          {activeTab === 'settings' && <SettingsView settings={settings} onChange={onChange} />}
          {activeTab === 'graphics' && <GraphicsSettings settings={settings} onChange={onChange} />}
          {activeTab === 'audio' && <AudioSettings settings={settings} onChange={onChange} profileId={profile.id} />}
          {activeTab === 'gameplay' && <GameplaySettings settings={settings} onChange={onChange} />}
          {activeTab === 'bugfixes' && <BugFixesSettings settings={settings} onChange={onChange} />}
          {activeTab === 'hud' && <HudSettings settings={settings} onChange={onChange} />}
          {activeTab === 'controls' && (
            <ControlsSettings settings={settings} onChange={onChange} profileId={profile.id} />
          )}
          {activeTab === 'haptics' && <HapticsSettings settings={settings} onChange={onChange} />}
          {activeTab === 'developer' && <DeveloperSettings settings={settings} onChange={onChange} />}
          {activeTab === 'mobile' && <MobileSettings settings={settings} onChange={onChange} />}
        </Box>
      </Box>
    </RandomizerLockContext.Provider>
  );
};

export { ProfileHubBody };
