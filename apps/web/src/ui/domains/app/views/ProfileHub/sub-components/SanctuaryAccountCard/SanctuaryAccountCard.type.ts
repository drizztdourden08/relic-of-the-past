/* @layer renderer-components @kind types */
import type { SanctuaryMe } from '@shared/ipc';

interface SignedOutStateProps {
  lastError: string | null;
  onSignIn: () => void;
}

interface WaitingStateProps {
  /** null until the API has minted the code. */
  userCode: string | null;
  onCancel: () => void;
}

interface SignedInStateProps {
  me: SanctuaryMe;
  onOpenSite: () => void;
  onSignOut: () => void;
}

export type { SignedOutStateProps, WaitingStateProps, SignedInStateProps };
