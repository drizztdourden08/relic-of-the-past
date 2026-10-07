/* @layer renderer-lib @kind types */
import type { SanctuaryMe, SanctuarySignInResult } from '@shared/ipc';

/**
 * The Sanctuary session port. The renderer sees one shape (sign in, cancel, sign out, who am
 * I, the user code while waiting); each host supplies an adapter.
 */
interface SanctuarySession {
  /** Resolves once the browser confirmed, denied or the code expired. */
  signIn: () => Promise<SanctuarySignInResult>;
  cancel: () => Promise<void>;
  signOut: () => Promise<void>;
  me: () => Promise<SanctuaryMe | null>;
  /** The user code to confirm on the site, delivered while signIn is pending. */
  subscribeDeviceCode: (listener: (userCode: string) => void) => () => void;
}

export type { SanctuarySession };
