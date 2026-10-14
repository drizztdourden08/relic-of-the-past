/* @layer renderer-components @kind types */
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import type { useProfileForm } from './useProfileForm';

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

interface ProfileRowsProps {
  profiles: Profile[];
  selected: string | null;
  onSelect: (id: string) => void;
  onOpen: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

export type {
  ProfileCreateFormProps, ProfileFormState, ProfileRowsProps, UseCreateProfileParams, UseProfileManagerParams,
};
