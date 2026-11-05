/* @layer renderer-components @kind types */
import type { WizardApi } from '@drizztdourden08/tessera/composites';
import type { ProfileWizardStepDef } from '@drizztdourden08/brock-react';
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import type { ProfilePresetId } from '../profile-presets';

type ProfileWizardValues = Record<string, unknown> & {
  name: string;
  rom: string;
  preset: ProfilePresetId;
  language: string;
  msuPack: string;
};

type ProfileWizardApi = WizardApi<ProfileWizardValues>;

type UpdateValues = (patch: Partial<ProfileWizardValues>) => void;

interface StepContext {
  joining: number | null;
  modules: readonly ProfileWizardStepDef[];
}

interface CreateContext {
  experimental: boolean;
  modules: readonly ProfileWizardStepDef[];
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
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
