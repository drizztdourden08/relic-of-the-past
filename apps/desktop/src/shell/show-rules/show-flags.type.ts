/* @layer renderer-app @kind types */
import type { ShowFlags } from '@drizztdourden08/brock-core/augment';

declare module '@drizztdourden08/brock-core/augment' {
  interface ShowFlags {
    signedIn?: boolean;
  }
}

export type { ShowFlags };
