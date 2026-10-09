/* @layer renderer-appshell @kind types */
import type { Dispatch, SetStateAction } from 'react';
import type { GameSettings } from '@rotp/features';
import type { ConfirmDialog } from '@app/views/GameSession/GameSession.type';

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
  setActiveProfile: (profile: Profile | null) => void;
  setLoadingProfile: Dispatch<SetStateAction<string | null>>;
}

interface RomActionsDeps {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  refreshProfilesAndRoms: () => Promise<unknown>;
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
  onGameClear: () => void;
}

export type { LoadProfileForGameDeps, ProfileLoadedData, ProfileManagementParams, RomActionsDeps };
