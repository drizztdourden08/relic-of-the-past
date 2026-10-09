/* @layer renderer-appshell @kind types */
import type { ComponentType } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import type { ProfileHubTab } from '../../ui/domains/app/views/ProfileHub/ProfileHub.type';
import type { PageId, RomDisplayInfo } from '../App.type';

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

type TitledPage = { title: string; View: ComponentType };

export type { PageRouterProps, TitledPage };
