/* @layer shared-types @kind types */
/**
 * The shared-account invoke channels: the device-code sign-in and the signed-in identity.
 * One device token serves every site's API. Split out of `InvokeContract` (which extends
 * this) for the line cap; the signatures still have their one source of truth here. The
 * user code shown while the app waits for the browser arrives on the `hub:deviceCode`
 * EVENT (see event-contract.ts).
 */
import type { Identity, SiteId, SiteUser } from '@shared/hub';

/** Why a sign-in ended without a token. */
type HubSignInFailure = 'denied' | 'expired' | 'cancelled' | 'unavailable' | 'error';

type HubSignInResult =
  | { ok: true }
  | { ok: false; reason: HubSignInFailure; message?: string };

/** The signed-in identity as the account card shows it; null when no device token is held. */
type HubMe = {
  user: SiteUser;
  identities: Identity[];
  /** This device's label as the API recorded it at confirm time. */
  deviceLabel: string;
};

interface HubInvokeContract {
  /**
   * Opens the browser on the site and polls until the device is confirmed, denied or expired.
   * The site decides whose confirm page opens; the Sanctuary when omitted. Either way the
   * token serves every site.
   */
  'hub:beginDeviceSignIn': (site?: SiteId) => Promise<HubSignInResult>;
  /** Stops the poll; the pending begin resolves with reason 'cancelled'. */
  'hub:cancelDeviceSignIn': () => Promise<void>;
  /** Drops the device token. The device row on the site stays until revoked there. */
  'hub:signOut': () => Promise<void>;
  /** null when no token is held, or when the API no longer accepts it (the token is dropped then). */
  'hub:me': () => Promise<HubMe | null>;
}

export type { HubInvokeContract, HubSignInFailure, HubSignInResult, HubMe };
