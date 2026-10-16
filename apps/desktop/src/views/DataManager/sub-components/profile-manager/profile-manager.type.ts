/* @layer renderer-components @kind types */
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import type { useProfileForm } from './useProfileForm';
import type { useProfileManager } from './useProfileManager';

interface UseProfileManagerParams {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onRefresh: () => void;
}

type ProfileFormState = ReturnType<typeof useProfileForm>;

interface UseCreateProfileParams {
  form: ProfileFormState;
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onRefresh: () => void;
  setCreating: (creating: boolean) => void;
}

interface ProfileCreateFormProps {
  form: ProfileFormState;
  readyRoms: RomDisplayInfo[];
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCancel: () => void;
  onCreate: () => void;
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

export type {
  ProfileCreateFormProps, ProfileListPaneProps, ProfileRowsProps, UseCreateProfileParams, UseProfileManagerParams,
};
