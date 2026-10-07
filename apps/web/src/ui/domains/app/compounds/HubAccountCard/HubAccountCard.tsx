/* @layer renderer-components @kind component */
/**
 * The shared-account row: one of three states. Signed out with a sign-in button, waiting
 * with the code to confirm in the browser, signed in with who and from which device. Bare:
 * the host passes the session, the site's words and the handlers.
 */
import { SignedOutState } from './sub-components/SignedOutState';
import { WaitingState } from './sub-components/WaitingState';
import { SignedInState } from './sub-components/SignedInState';
import type { HubAccountCardProps } from './HubAccountCard.type';
import './HubAccountCard.css';

const HubAccountCard = (props: HubAccountCardProps) => {
  const { state, me, userCode, lastError, copy, onSignIn, onCancel, onSignOut, onOpenSite } = props;
  if (state === 'waiting') return <WaitingState userCode={userCode} siteHost={copy.siteHost} onCancel={onCancel} />;
  if (state === 'signed-in' && me) {
    return <SignedInState me={me} openSiteLabel={copy.openSiteLabel} onOpenSite={onOpenSite} onSignOut={onSignOut} />;
  }
  return <SignedOutState lastError={lastError} lead={copy.signedOutLead} signInLabel={copy.signInLabel} onSignIn={onSignIn} />;
};

export { HubAccountCard };
