/* @layer renderer-components @kind hook */
import { useCallback, useEffect } from 'react';
import { useHubSessionStore } from '@app/stores/hub-session';
import { STORE_SITE_URL } from '@rotp/hub-client';

const useStoreAccount = () => {
  const me = useHubSessionStore((s) => s.me);
  const state = useHubSessionStore((s) => s.state);
  const userCode = useHubSessionStore((s) => s.userCode);
  const lastError = useHubSessionStore((s) => s.lastError);
  const refresh = useHubSessionStore((s) => s.refresh);
  const signIn = useHubSessionStore((s) => s.signIn);
  const cancel = useHubSessionStore((s) => s.cancel);
  const signOut = useHubSessionStore((s) => s.signOut);

  useEffect(() => { void refresh(); }, [refresh]);

  const onSignIn = useCallback(() => { void signIn('store'); }, [signIn]);
  const onCancel = useCallback(() => { void cancel(); }, [cancel]);
  const onSignOut = useCallback(() => { void signOut(); }, [signOut]);
  const onSignedOut = useCallback(() => { void refresh(); }, [refresh]);
  const onOpenSite = useCallback(() => { window.open(STORE_SITE_URL, '_blank'); }, []);

  return {
    me,
    state,
    userCode,
    lastError,
    signedIn: state === 'signed-in' && me !== null,
    onSignIn,
    onCancel,
    onSignOut,
    onSignedOut,
    onOpenSite,
  };
};

export { useStoreAccount };
