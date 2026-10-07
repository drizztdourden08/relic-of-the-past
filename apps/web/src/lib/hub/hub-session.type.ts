/* @layer renderer-lib @kind types */
import type { SiteId } from '@shared/hub';
import type { HubMe, HubSignInResult } from '@shared/ipc';

/**
 * The shared-account session port. The renderer sees one shape (sign in, cancel, sign out,
 * who am I, the user code while waiting); each host supplies an adapter.
 */
interface HubSession {
  /**
   * Resolves once the browser confirmed, denied or the code expired. The confirm page opens
   * on `site`, the Sanctuary when omitted; the account and the token are the same either way.
   */
  signIn: (site?: SiteId) => Promise<HubSignInResult>;
  cancel: () => Promise<void>;
  signOut: () => Promise<void>;
  me: () => Promise<HubMe | null>;
  /** The user code to confirm on the site, delivered while signIn is pending. */
  subscribeDeviceCode: (listener: (userCode: string) => void) => () => void;
}

export type { HubSession };
