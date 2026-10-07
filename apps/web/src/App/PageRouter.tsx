/* @layer renderer-appshell @kind component */
import { useCallback } from 'react';
import { HubGameControls, ProfileHub } from '../ui/domains/app/views/ProfileHub';
import { DataManager } from '../ui/domains/app/views/DataManager';
import { Store } from '../ui/domains/app/views/Store';
import { SpriteDebug } from '../ui/domains/app/views/SpriteDebug';
import { Randomizer } from '../ui/domains/app/views/Randomizer';
import { SIMPLE_PAGES } from './simple-pages';
import { FullScreenLayer } from '../ui/design-system/composites/FullScreenLayer';
import { WorkspaceSwitch, type Workspace } from '../ui/domains/app/compounds/WorkspaceSwitch';
import type { PageId, RomDisplayInfo } from './types';
import type { GameSettings } from '@shared/types/settings';
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import type { ProfileHubTab } from '../ui/domains/app/views/ProfileHub/ProfileHub.type';

interface PageRouterProps {
  nav: {
    activePage: PageId;
    setActivePage: (page: PageId) => void;
    closePage: () => void;
  };
  profileMgmt: {
    profiles: Profile[];
    activeProfile: Profile | null;
    romDisplayInfos: RomDisplayInfo[];
    importingRom: boolean;
    loadingProfile: string | null;
    loadProfileForGame: (profile: Profile) => Promise<void>;
    refreshProfilesAndRoms: () => Promise<unknown>;
    handleSelectProfile: (profile: Profile) => Promise<void>;
    handleCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
    handleDeleteProfile: (id: string) => void;
    handleImportRom: () => Promise<void>;
    handleExtractAssets: (romFile: string) => Promise<void>;
    handleDeleteRom: (romFile: string) => void;
  };
  game: {
    isRunning: boolean;
    stop: () => void;
  };
  display: {
    handleWindowModeChange: (mode: GameSettings['windowMode']) => void;
    handleConstraintSettingsChange: (constraint: GameSettings['viewportConstraint'], ar: GameSettings['aspectRatio']) => void;
    handleDisplayPerfChange: (enabled: boolean) => void;
    handleEdgeEffectChange: (enabled: boolean) => void;
    handleShadowCastingChange: (enabled: boolean) => void;
    handlePixelPerfectChange: (enabled: boolean) => void;
  };
  audio: {
    handleMasterVolumeChange: (volume: number) => void;
    muteOverride: { volume: number; version: number } | null;
  };
  saveState: {
    handleSaveSlotSettingsChange: (enabled: boolean, duration: number) => void;
  };
  handleDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  dataTab: string;
  profileHubTab: ProfileHubTab;
  onProfileHubTabChange: (tab: ProfileHubTab) => void;
}

const PageRouter = (props: PageRouterProps) => {
  const { nav, profileMgmt, game, display, audio, saveState, handleDeleteConfirm, dataTab, profileHubTab, onProfileHubTabChange } = props;

  const handleStartGame = useCallback(() => {
    if (profileMgmt.activeProfile) {
      profileMgmt.loadProfileForGame(profileMgmt.activeProfile);
      nav.setActivePage('none');
    }
  }, [profileMgmt, nav]);

  const handleResetGame = useCallback(() => {
    if (profileMgmt.activeProfile) {
      game.stop();
      profileMgmt.loadProfileForGame(profileMgmt.activeProfile);
    }
  }, [profileMgmt, game]);

  // ProfileHub stays mounted to preserve scroll/state; other pages use early returns
  let otherPage: React.ReactNode = null;
  const switchTo = (current: Workspace) => (
    <WorkspaceSwitch current={current} hasProfile={!!profileMgmt.activeProfile} hasRandomizer={!!profileMgmt.activeProfile?.randomizer} onSelect={nav.setActivePage} />
  );

  const simplePage = SIMPLE_PAGES[nav.activePage];

  if (nav.activePage === 'data') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Data Manager" floating={switchTo('data')}>
        <DataManager
          profiles={profileMgmt.profiles}
          romStatuses={profileMgmt.romDisplayInfos}
          onSelectProfile={(p: Profile) => { profileMgmt.handleSelectProfile(p); nav.setActivePage('profile'); }}
          onCreateProfile={async (opts: CreateProfileOptions) => {
            const result = await profileMgmt.handleCreateProfile(opts);
            // Only leave the form on success. A failure keeps it open to show the error.
            if (result.success) nav.setActivePage('profile');
            return result;
          }}
          onDeleteProfile={profileMgmt.handleDeleteProfile}
          onImportRom={profileMgmt.handleImportRom}
          onExtractAssets={profileMgmt.handleExtractAssets}
          onDeleteRom={profileMgmt.handleDeleteRom}
          onRefresh={profileMgmt.refreshProfilesAndRoms}
          onDeleteConfirm={handleDeleteConfirm}
          loadingProfile={profileMgmt.loadingProfile}
          initialTab={dataTab as any}
          isGameRunning={game.isRunning}
        />
      </FullScreenLayer>
    );
  } else if (nav.activePage === 'store') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Hookshop" floating={switchTo('store')}>
        <Store onLibraryChanged={profileMgmt.refreshProfilesAndRoms} onDeleteConfirm={handleDeleteConfirm} />
      </FullScreenLayer>
    );
  } else if (simplePage) {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title={simplePage.title}>
        {simplePage.render()}
      </FullScreenLayer>
    );
  } else if (nav.activePage === 'sprite-debug') {
    // SpriteDebug brings its own FullScreenLayer (title + close), so render it directly.
    otherPage = <SpriteDebug onClose={nav.closePage} romFile={profileMgmt.activeProfile?.romFile ?? ''} />;
  } else if (nav.activePage === 'randomizer') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Randomizer" floating={switchTo('randomizer')}>
        <Randomizer activeProfile={profileMgmt.activeProfile} />
      </FullScreenLayer>
    );
  }

  const profileHubVisible = nav.activePage === 'profile' && !!profileMgmt.activeProfile;

  return (
    <>
      {otherPage}
      {profileMgmt.activeProfile && (
        <FullScreenLayer
          onClose={nav.closePage}
          hidden={!profileHubVisible}
          title="Home"
          subtitle={profileMgmt.activeProfile.name}
          floating={switchTo('profile')}
          extra={profileHubTab !== 'home' && (
            <HubGameControls
              isGameRunning={game.isRunning}
              showPlay
              onStartGame={handleStartGame}
              onStopGame={game.stop}
              onResetGame={handleResetGame}
            />
          )}
        >
          <ProfileHub
            profile={profileMgmt.activeProfile}
            isGameRunning={game.isRunning}
            onStartGame={handleStartGame}
            onStopGame={game.stop}
            onResetGame={handleResetGame}
            onWindowModeChange={display.handleWindowModeChange}
            onConstraintSettingsChange={display.handleConstraintSettingsChange}
            onMasterVolumeChange={audio.handleMasterVolumeChange}
            onDisplayPerfChange={display.handleDisplayPerfChange}
            onEdgeEffectChange={display.handleEdgeEffectChange}
            onShadowCastingChange={display.handleShadowCastingChange}
            onPixelPerfectChange={display.handlePixelPerfectChange}
            onSaveSlotSettingsChange={saveState.handleSaveSlotSettingsChange}
            masterVolumeOverride={audio.muteOverride}
            activeTab={profileHubTab}
            onTabChange={onProfileHubTabChange}
          />
        </FullScreenLayer>
      )}
    </>
  );
};

export { PageRouter };
