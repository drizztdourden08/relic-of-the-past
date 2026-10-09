/* @layer renderer-appshell @kind component */
import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { HubGameControls, ProfileHub } from '../../ui/domains/app/views/ProfileHub';
import { DataManager } from '../../ui/domains/app/views/DataManager';
import type { DataTab } from '../../ui/domains/app/views/DataManager/DataManager.type';
import { Store } from '../../ui/domains/app/views/Store';
import { HudLayoutEditor } from '../../ui/domains/app/views/HudLayoutEditor';
import { SpriteDebug } from '../../ui/domains/app/views/SpriteDebug';
import { Randomizer } from '../../ui/domains/app/views/Randomizer';
import { FullScreenLayer } from '../../ui/design-system/composites/FullScreenLayer';
import { WorkspaceSwitch, type Workspace } from '../../ui/domains/app/compounds/WorkspaceSwitch';
import type { CreateProfileOptions } from '@shared/types/profile';
import type { PageRouterProps } from './PageRouter.type';
import { TITLED_PAGES } from './PageRouter.constants';

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

  let otherPage: ReactNode = null;
  const switchTo = (current: Workspace) => (
    <WorkspaceSwitch current={current} hasProfile={!!profileMgmt.activeProfile} hasRandomizer={!!profileMgmt.activeProfile?.randomizer} onSelect={nav.setActivePage} />
  );

  const titledPage = TITLED_PAGES[nav.activePage];

  if (nav.activePage === 'data') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Data Manager" floating={switchTo('data')}>
        <DataManager
          profiles={profileMgmt.profiles}
          romStatuses={profileMgmt.romDisplayInfos}
          onSelectProfile={(p: Profile) => { profileMgmt.handleSelectProfile(p); nav.setActivePage('profile'); }}
          onCreateProfile={async (opts: CreateProfileOptions) => {
            const result = await profileMgmt.handleCreateProfile(opts);
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
          initialTab={dataTab as DataTab}
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
  } else if (nav.activePage === 'hud-layout') {
    otherPage = <HudLayoutEditor onClose={nav.closePage} />;
  } else if (titledPage) {
    const { title, View } = titledPage;
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title={title}>
        <View />
      </FullScreenLayer>
    );
  } else if (nav.activePage === 'sprite-debug') {
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
