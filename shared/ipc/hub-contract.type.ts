/* @layer shared-types @kind types */
import type { Identity, SiteId, SiteUser } from '@shared/hub';

type HubSignInFailure = 'denied' | 'expired' | 'cancelled' | 'unavailable' | 'error';

type HubSignInResult =
  | { ok: true }
  | { ok: false; reason: HubSignInFailure; message?: string };

type HubMe = {
  user: SiteUser;
  identities: Identity[];
  deviceLabel: string;
};

interface HubInvokeContract {
  'hub:beginDeviceSignIn': (site?: SiteId) => Promise<HubSignInResult>;
  'hub:cancelDeviceSignIn': () => Promise<void>;
  'hub:signOut': () => Promise<void>;
  'hub:me': () => Promise<HubMe | null>;
}

export type { HubInvokeContract, HubSignInFailure, HubSignInResult, HubMe };
