/* @layer renderer-components @kind types */
import type { HubMe } from '@app/ipc';

type HubAccountState = 'signed-out' | 'waiting' | 'signed-in';

interface HubAccountCopy {
  signedOutLead: string;
  signInLabel: string;
  openSiteLabel: string;
  siteHost: string;
}

interface HubAccountCardProps {
  state: HubAccountState;
  me: HubMe | null;
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

  HubAccountCopy,
  HubAccountCardProps,
  SignedOutStateProps,
  WaitingStateProps,
  SignedInStateProps,
};
