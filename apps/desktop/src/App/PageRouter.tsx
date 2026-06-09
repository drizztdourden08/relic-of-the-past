/* @layer renderer-appshell @kind component */
import { useCallback } from 'react';
import { ProfilePicker } from '../ui/domains/app/views/ProfilePicker';
import { ProfileHub } from '../ui/domains/app/views/ProfileHub';
import { DataManager } from '../ui/domains/app/views/DataManager';
import { InputCalibration } from '../ui/domains/app/views/InputTester';
import { CreditsPage } from '../ui/domains/app/views/ProfileHub/sub-components/CreditsTab';
import { DesignGallery } from '../ui/domains/app/views/DesignGallery';
import { FullScreenLayer } from '../ui/design-system/composites/FullScreenLayer';
import type { PageId, RomDisplayInfo } from './types';
import type { GameSettings } from '@shared/types/settings';
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
    refreshProfilesAndRoms: () => Promise<void>;
    handleSelectProfile: (profile: Profile) => Promise<void>;
    handleCreateProfile: (name: string, romFile: string, language?: string, msuPack?: string) => Promise<void>;
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
  };
  audio: {
    handleMasterVolumeChange: (volume: number) => void;
    muteOverride: { volume: number; version: number } | null;
  };
  saveState: {
    handleSaveSlotSettingsChange: (enabled: boolean, duration: number) => void;
  };
  handleDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  handleShowPicker: () => void;
  dataTab: string;
  profileHubTab: ProfileHubTab;
  onProfileHubTabChange: (tab: ProfileHubTab) => void;
}

const PageRouter = (props: PageRouterProps) => {
  const { nav, profileMgmt, game, display, audio, saveState, handleDeleteConfirm, handleShowPicker, dataTab, profileHubTab, onProfileHubTabChange } = props;

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

  if (nav.activePage === 'picker') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Profiles">
        <ProfilePicker
          profiles={profileMgmt.profiles}
          romStatuses={profileMgmt.romDisplayInfos}
          onSelectProfile={(p: Profile) => { profileMgmt.handleSelectProfile(p); nav.setActivePage('profile'); }}
          onCreateProfile={(name: string, romFile: string) => { profileMgmt.handleCreateProfile(name, romFile); nav.setActivePage('profile'); }}
          onDeleteProfile={profileMgmt.handleDeleteProfile}
          onImportRom={profileMgmt.handleImportRom}
          onExtractAssets={profileMgmt.handleExtractAssets}
          onDeleteRom={profileMgmt.handleDeleteRom}
          importingRom={profileMgmt.importingRom}
          loadingProfile={profileMgmt.loadingProfile}
        />
      </FullScreenLayer>
    );
  } else if (nav.activePage === 'data') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Data Manager">
        <DataManager
          profiles={profileMgmt.profiles}
          romStatuses={profileMgmt.romDisplayInfos}
          onSelectProfile={(p: Profile) => { profileMgmt.handleSelectProfile(p); nav.setActivePage('profile'); }}
          onCreateProfile={(name: string, rom: string, lang?: string, msu?: string) => { profileMgmt.handleCreateProfile(name, rom, lang, msu); nav.setActivePage('profile'); }}
          onDeleteProfile={profileMgmt.handleDeleteProfile}
          onImportRom={profileMgmt.handleImportRom}
          onExtractAssets={profileMgmt.handleExtractAssets}
          onDeleteRom={profileMgmt.handleDeleteRom}
          onRefresh={profileMgmt.refreshProfilesAndRoms}
          onDeleteConfirm={handleDeleteConfirm}
          loadingProfile={profileMgmt.loadingProfile}
          initialTab={dataTab as any}
          isGameRunning={game.isRunning}
          onSwitchProfile={handleShowPicker}
        />
      </FullScreenLayer>
    );
  } else if (nav.activePage === 'input-tester') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Input Calibration">
        <InputCalibration />
      </FullScreenLayer>
    );
  } else if (nav.activePage === 'credits') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Credits">
        <CreditsPage />
      </FullScreenLayer>
    );
  } else if (nav.activePage === 'design-gallery') {
    otherPage = (
      <FullScreenLayer onClose={nav.closePage} title="Design Gallery">
        <DesignGallery />
      </FullScreenLayer>
    );
  }

  const profileHubVisible = nav.activePage === 'profile' && !!profileMgmt.activeProfile;

  return (
    <>
      {otherPage}
      {profileMgmt.activeProfile && (
        <FullScreenLayer onClose={nav.closePage} hidden={!profileHubVisible} title="Home">

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
