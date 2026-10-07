/* @layer renderer-components @kind types */
import type { HubMe } from '@shared/ipc';

type HubAccountState = 'signed-out' | 'waiting' | 'signed-in';

/** The words that name the site the card signs in to. */
interface HubAccountCopy {
  /** Signed out: why to sign in. */
  signedOutLead: string;
  signInLabel: string;
  openSiteLabel: string;
  /** The host the browser opens while the code waits. */
  siteHost: string;
}

interface HubAccountCardProps {
  state: HubAccountState;
  me: HubMe | null;
  /** null until the API has minted the code. */
  userCode: string | null;
  lastError: string | null;
  copy: HubAccountCopy;
  onSignIn: () => void;
  onCancel: () => void;
  onSignOut: () => void;
  onOpenSite: () => void;
}

interface SignedOutStateProps {
  lastError: string | null;
  lead: string;
  signInLabel: string;
  onSignIn: () => void;
}

interface WaitingStateProps {
  /** null until the API has minted the code. */
  userCode: string | null;
  siteHost: string;
  onCancel: () => void;
}

interface SignedInStateProps {
  me: HubMe;
  openSiteLabel: string;
  onOpenSite: () => void;
  onSignOut: () => void;
}

export type {
  HubAccountState,
  HubAccountCopy,
  HubAccountCardProps,
  SignedOutStateProps,
  WaitingStateProps,
  SignedInStateProps,
};
