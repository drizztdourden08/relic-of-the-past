/* @layer renderer-components @kind types */
import type { Profile, CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import type { RomDisplayInfo } from '../../../../../App/types';

type DataTab = 'home' | 'profiles' | 'roms' | 'languages' | 'msu' | 'sprites' | 'linkSprites';

interface DataManagerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onDeleteProfile: (id: string) => void;
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  onRefresh: () => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  loadingProfile?: string | null;
  initialTab?: DataTab;
  isGameRunning?: boolean;
}

export type {
  DataTab,
  DataManagerProps,
};
