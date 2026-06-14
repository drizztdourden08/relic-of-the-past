/* @layer renderer-components @kind types */
import type { Profile } from '@shared/types/profile';
import type { RomDisplayInfo } from '../../../../../App/types';

type DataTab = 'home' | 'profiles' | 'roms' | 'languages' | 'msu' | 'sprites';

interface DataManagerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (name: string, romFile: string, language?: string, msuPack?: string) => void;
  onDeleteProfile: (id: string) => void;
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  onRefresh: () => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  loadingProfile?: string | null;
  initialTab?: DataTab;
  isGameRunning?: boolean;
  onSwitchProfile: () => void;
}

export type {
  DataTab,
  DataManagerProps,
};
