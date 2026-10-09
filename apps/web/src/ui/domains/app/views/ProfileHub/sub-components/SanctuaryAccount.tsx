/* @layer renderer-components @kind component */
import { useCallback, useEffect } from 'react';
import { useHubSessionStore } from '@app/stores/hub-session';
import { SANCTUARY_SITE_URL } from '@app/lib/sanctuary/sanctuary-site';
import { HubAccountCard } from '../../../compounds/HubAccountCard';
import { SANCTUARY_COPY } from './SanctuaryAccount.constants';

const SanctuaryAccount = () => {
  const me = useHubSessionStore((s) => s.me);
  const state = useHubSessionStore((s) => s.state);
  const userCode = useHubSessionStore((s) => s.userCode);
  const lastError = useHubSessionStore((s) => s.lastError);
  const refresh = useHubSessionStore((s) => s.refresh);
  const signIn = useHubSessionStore((s) => s.signIn);
  const cancel = useHubSessionStore((s) => s.cancel);
  const signOut = useHubSessionStore((s) => s.signOut);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleSignIn = useCallback(() => { void signIn(); }, [signIn]);
  const handleCancel = useCallback(() => { void cancel(); }, [cancel]);
  const handleSignOut = useCallback(() => { void signOut(); }, [signOut]);
  const handleOpenSite = useCallback(() => { window.open(SANCTUARY_SITE_URL, '_blank'); }, []);

  return (
    <HubAccountCard
      state={state}
      me={me}
      userCode={userCode}
      lastError={lastError}
      copy={SANCTUARY_COPY}
      onSignIn={handleSignIn}
      onCancel={handleCancel}
      onSignOut={handleSignOut}
      onOpenSite={handleOpenSite}
    />
  );
};

export { SanctuaryAccount };
