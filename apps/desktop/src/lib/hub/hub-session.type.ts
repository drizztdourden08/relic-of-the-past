/* @layer renderer-lib @kind types */
import type { SiteId } from '@shared/hub';
import type { HubMe, HubSignInResult } from '@shared/ipc';

interface HubSession {
  signIn: (site?: SiteId) => Promise<HubSignInResult>;
  cancel: () => Promise<void>;
  signOut: () => Promise<void>;
  me: () => Promise<HubMe | null>;
  subscribeDeviceCode: (listener: (userCode: string) => void) => () => void;
}

export type { HubSession };
