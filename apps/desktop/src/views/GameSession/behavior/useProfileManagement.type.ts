/* @layer renderer-appshell @kind types */
import type { Dispatch, SetStateAction } from 'react';
import type { GameSettings } from '@rotp/features';
import type { useProfiles } from '@drizztdourden08/brock-react';
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
  onGameStop: () => Promise<void>;
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

interface DeleteRomDeps extends RomActionsDeps {
  setExtractionStates: Dispatch<SetStateAction<Record<string, RomExtractionStatus>>>;
}

interface DeleteProfileDeps {
  profiles: Profile[];
  stopGame: () => Promise<void>;
  removeConfirmed: ReturnType<typeof useProfiles>['removeConfirmed'];
  refreshProfilesAndRoms: () => Promise<unknown>;
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
}

export type { DeleteProfileDeps, DeleteRomDeps, LoadProfileForGameDeps, ProfileLoadedData, ProfileManagementParams, RomActionsDeps };
