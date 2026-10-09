/* @layer renderer-app @kind types */
import type { ProfileCreateExtension, ProfileExtension, ProfilePatchExtension } from '@drizztdourden08/brock-core/augment';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

declare module '@drizztdourden08/brock-core/augment' {
  interface ProfileExtension {
    romFile: string;
    language?: string;
    msuPack?: string;
    randomizer?: ProfileRandomizerConfig;
  }
  interface ProfileCreateExtension {
    romFile?: string;
    language?: string;
    msuPack?: string;
    randomizer?: ProfileRandomizerConfig;
  }
  interface ProfilePatchExtension {
    language?: string | null;
    msuPack?: string | null;
    randomizer?: ProfileRandomizerConfig | null;
  }
}

export type { ProfileCreateExtension, ProfileExtension, ProfilePatchExtension };
