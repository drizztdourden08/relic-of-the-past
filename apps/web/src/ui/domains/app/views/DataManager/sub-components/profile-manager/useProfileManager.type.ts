/* @layer renderer-components @kind types */
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';

interface UseProfileManagerParams {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onRefresh: () => void;
}

export type { UseProfileManagerParams };
