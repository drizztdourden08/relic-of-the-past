/* @layer renderer-components @kind types */
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';

interface UseProfileManagerParams {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onRefresh: () => void;
}

export type { UseProfileManagerParams };
