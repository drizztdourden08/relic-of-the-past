/* @layer renderer-app @kind types */
import type { ProfileCreateExtension, ProfileExtension, ProfilePatchExtension } from '@drizztdourden08/brock-core/augment';

declare module '@drizztdourden08/brock-core/augment' {
  interface ProfileExtension {
    romFile: string;
    language?: string;
    msuPack?: string;
  }
  interface ProfileCreateExtension {
    romFile?: string;
    language?: string;
    msuPack?: string;
  }
  interface ProfilePatchExtension {
    language?: string | null;
    msuPack?: string | null;
  }
}

export type { ProfileCreateExtension, ProfileExtension, ProfilePatchExtension };
