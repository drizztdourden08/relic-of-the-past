/* @layer renderer-components @kind component */
/**
 * The "Sanctuary account" row of the Contributor tab. One of three states: signed out with a
 * sign-in button, waiting with the code to confirm in the browser, signed in with who and
 * from which device. Reads the session store; the three states themselves are bare.
 */
import { useCallback, useEffect } from 'react';
import { useSanctuarySessionStore } from '@app/stores/sanctuary-session';
import { SANCTUARY_SITE_URL } from '@app/lib/sanctuary/sanctuary-site';
import { SignedOutState } from './sub-components/SignedOutState';
import { WaitingState } from './sub-components/WaitingState';
import { SignedInState } from './sub-components/SignedInState';
import './SanctuaryAccountCard.css';

const SanctuaryAccountCard = () => {
  const me = useSanctuarySessionStore((s) => s.me);
  const state = useSanctuarySessionStore((s) => s.state);
  const userCode = useSanctuarySessionStore((s) => s.userCode);
  const lastError = useSanctuarySessionStore((s) => s.lastError);
  const refresh = useSanctuarySessionStore((s) => s.refresh);
  const signIn = useSanctuarySessionStore((s) => s.signIn);
  const cancel = useSanctuarySessionStore((s) => s.cancel);
  const signOut = useSanctuarySessionStore((s) => s.signOut);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleSignIn = useCallback(() => { void signIn(); }, [signIn]);
  const handleCancel = useCallback(() => { void cancel(); }, [cancel]);
  const handleSignOut = useCallback(() => { void signOut(); }, [signOut]);
  // window.open on an external URL is routed to the system browser by the main process.
  const handleOpenSite = useCallback(() => { window.open(SANCTUARY_SITE_URL, '_blank'); }, []);

  if (state === 'waiting') return <WaitingState userCode={userCode} onCancel={handleCancel} />;
  if (state === 'signed-in' && me) return <SignedInState me={me} onOpenSite={handleOpenSite} onSignOut={handleSignOut} />;
  return <SignedOutState lastError={lastError} onSignIn={handleSignIn} />;
};

export { SanctuaryAccountCard };
