/* @layer renderer-appshell @kind types */
import type { Dispatch, SetStateAction } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { ConfirmDialog } from '../App.type';

interface ProfileLoadedData {
  assetData: Uint8Array;
  configIni: string;
  settings: GameSettings;
}

interface ProfileManagementParams {
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
  onProfileLoaded: (data: ProfileLoadedData) => void;
  onGameClear: () => void;
}

interface LoadProfileForGameDeps {
  onGameClear: () => void;
  onProfileLoaded: (data: ProfileLoadedData) => void;
  setActiveProfile: Dispatch<SetStateAction<Profile | null>>;
  setLoadingProfile: Dispatch<SetStateAction<string | null>>;
}

interface RomActionsDeps {
  activeProfile: Profile | null;
  setActiveProfile: Dispatch<SetStateAction<Profile | null>>;
  refreshProfilesAndRoms: () => Promise<unknown>;
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
  onGameClear: () => void;
}

export type { LoadProfileForGameDeps, ProfileLoadedData, ProfileManagementParams, RomActionsDeps };
