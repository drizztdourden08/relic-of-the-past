/* @layer site-kit @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { getMe, signOut as signOutRequest, ApiError, errorMessage } from '@rotp/hub-client';
import type { Session } from '../../session/session-context';
import { SIGNED_OUT } from './useSession.constants';
import type { SessionState } from './useSession.type';

const useSession = (): Session => {
  const [state, setState] = useState<SessionState>({ ...SIGNED_OUT, loading: true });

  const refresh = useCallback(async () => {
    try {
      const { user, identities, groups, rights } = await getMe();
      setState({ me: user, identities, groups: groups ?? [], rights: rights ?? null, loading: false, error: null });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setState(SIGNED_OUT);
        return;
      }
      setState({ ...SIGNED_OUT, error: errorMessage(error) });
    }
  }, []);

  const signOut = useCallback(async (everywhere = false) => {
    await signOutRequest(everywhere);
    setState(SIGNED_OUT);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const { me, identities, groups, rights, loading, error } = state;
  return { me, access: me?.access ?? null, identities, groups, rights, loading, error, refresh, signOut };
};

export { useSession };
