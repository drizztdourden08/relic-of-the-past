/* @layer renderer-components @kind types */
import type { WizardApi } from '@drizztdourden08/tessera/composites';
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import type { ProfilePresetId } from '../profile-presets';
import type { RandomizerFormState } from '../build-randomizer-config';

interface ProfileWizardValues {
  name: string;
  rom: string;
  preset: ProfilePresetId;
  language: string;
  msuPack: string;
  randomizer: RandomizerFormState;
}

type ProfileWizardApi = WizardApi<ProfileWizardValues>;

type UpdateValues = (patch: Partial<ProfileWizardValues>) => void;

interface StepContext {
  experimental: boolean;
  joining: number | null;
}

interface CreateContext {
  experimental: boolean;
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onProgress: (fraction: number | null) => void;
}

interface ProfileCreateWizardProps {
  readyRoms: RomDisplayInfo[];
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onCancel: () => void;
  onCreated: (profileId: string) => void;
}

interface UseProfileWizardParams {
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onCreated: (profileId: string) => void;
}

export type {
  CreateContext, ProfileCreateWizardProps, ProfileWizardApi, ProfileWizardValues, StepContext, UpdateValues, UseProfileWizardParams,
};
