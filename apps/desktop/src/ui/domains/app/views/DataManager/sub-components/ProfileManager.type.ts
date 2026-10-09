/* @layer renderer-components @kind types */
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';

interface ProfileManagerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onDeleteProfile: (id: string) => void;
  onRefresh: () => void;
  isGameRunning: boolean;
  loadingProfile?: string | null;
}

export type { ProfileManagerProps };
