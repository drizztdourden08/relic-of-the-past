/* @layer renderer-components @kind component */
/**
 * The content of one hub tab. Shared by the active page and the search
 * results pane, which draws the same components through SettingsPageContext.
 */
import { useContext } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { GameSettings } from '@shared/types/settings';
import { SettingsPage } from '../../../compounds/SettingsPage';
import { SettingsPageContext } from '../../../compounds/SettingsLayout';
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
import { PROFILE_HUB_TABS } from '../ProfileHub.constants';
import type { ProfileHubProps, ProfileHubTab } from '../ProfileHub.type';

interface ProfileHubTabContentProps {
  tab: ProfileHubTab;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profile: ProfileHubProps['profile'];
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
}

const ProfileHubTabContent = (props: ProfileHubTabContentProps) => {
  const { tab, settings, onChange, profile, isGameRunning, onStartGame, onStopGame, onResetGame } = props;
  const page = useContext(SettingsPageContext);
  switch (tab) {
    case 'home':
      return (
        <HomeTab
          profileId={profile.id}
          romFile={profile.romFile}
          isGameRunning={isGameRunning}
          onStartGame={onStartGame}
          onStopGame={onStopGame}
          onResetGame={onResetGame}
          lastPlayed={profile.lastPlayed}
          created={profile.created}
          randomizer={profile.randomizer}
          vanillaSafe={settings.vanillaSafe}
        />
      );
    case 'settings': return <SettingsView settings={settings} onChange={onChange} part="display" />;
    case 'camera': return <SettingsView settings={settings} onChange={onChange} part="camera" />;
    case 'window': return <SettingsView settings={settings} onChange={onChange} part="window" />;
    case 'graphics': return <GraphicsSettings settings={settings} onChange={onChange} />;
    case 'audio': return <AudioSettings settings={settings} onChange={onChange} profileId={profile.id} />;
    case 'gameplay': return <GameplaySettings settings={settings} onChange={onChange} />;
    case 'bugfixes': return <BugFixesSettings settings={settings} onChange={onChange} />;
    case 'hud': return <HudSettings settings={settings} onChange={onChange} />;
    case 'haptics': return <HapticsSettings settings={settings} onChange={onChange} />;
    case 'developer': return <DeveloperSettings settings={settings} onChange={onChange} />;
    case 'mobile': return <MobileSettings settings={settings} onChange={onChange} />;
    case 'controls':
      // The binding screen lays out and scrolls its own columns, so the page only draws its header.
      return (
        <SettingsPage icon={<IconifyIcon icon={PROFILE_HUB_TABS.controls.navIcon} />} title={PROFILE_HUB_TABS.controls.label} backdrop={page?.backdrop} scroll={false}>
          <ControlsSettings settings={settings} onChange={onChange} profileId={profile.id} />
        </SettingsPage>
      );
  }
};

export { ProfileHubTabContent };
export type { ProfileHubTabContentProps };
