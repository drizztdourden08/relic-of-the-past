/* @layer renderer-components @kind hook */
/**
 * The shared account as the Hookshop tab uses it. Signing in from here opens the confirm page
 * on the store's own site; the account and the device token are the ones the Sanctuary uses.
 */
import { useCallback, useEffect } from 'react';
import { useHubSessionStore } from '@app/stores/hub-session';
import { STORE_SITE_URL } from '@app/lib/store/store-site';

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
  /** The API refused the token: read the session again so the tab shows the sign-in card. */
  const onSignedOut = useCallback(() => { void refresh(); }, [refresh]);
  // window.open on an external URL is routed to the system browser by the main process.
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

type StoreAccount = ReturnType<typeof useStoreAccount>;

export { useStoreAccount };
export type { StoreAccount };
