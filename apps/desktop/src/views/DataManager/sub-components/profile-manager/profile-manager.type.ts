/* @layer renderer-components @kind types */
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import type { useProfileManager } from './useProfileManager';

interface UseProfileManagerParams {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onRefresh: () => void;
}

type CreateFn = (opts: CreateProfileOptions) => Promise<CreateProfileResult>;

interface LobbyJoinChoice {
  seat: string | null;
  onProgress: (fraction: number) => void;
}

type ProfileManagerState = ReturnType<typeof useProfileManager>;

interface ProfileListPaneProps {
  manager: ProfileManagerState;
  profiles: Profile[];
  loadingProfile?: string | null;
  onOpen: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

interface ProfileRowsProps {
  profiles: Profile[];
  selected: string | null;
  onSelect: (id: string) => void;
  onOpen: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

export type { CreateFn, LobbyJoinChoice, ProfileListPaneProps, ProfileRowsProps, UseProfileManagerParams };
