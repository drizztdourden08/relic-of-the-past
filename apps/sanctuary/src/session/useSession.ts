/* @layer sanctuary-site @kind hook */
/**
 * Loads GET /me once on mount and keeps the answer. A 401 is a signed-out visitor, not an
 * error; anything else is kept as the error message so the page can say the API is down.
 */
import { useCallback, useEffect, useState } from 'react';
import type { SanctuaryUser, Identity } from '@shared/sanctuary/types';
import { getMe, signOut as signOutRequest } from '../api/endpoints';
import { ApiError, errorMessage } from '../api/client';
import type { Session } from './session-context';

type SessionState = {
  me: SanctuaryUser | null;
  identities: Identity[];
  loading: boolean;
  error: string | null;
};

const SIGNED_OUT: SessionState = { me: null, identities: [], loading: false, error: null };

const useSession = (): Session => {
  const [state, setState] = useState<SessionState>({ ...SIGNED_OUT, loading: true });

  const refresh = useCallback(async () => {
    try {
      const { user, identities } = await getMe();
      setState({ me: user, identities, loading: false, error: null });
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

  const { me, identities, loading, error } = state;
  return { me, access: me?.access ?? null, identities, loading, error, refresh, signOut };
};

export { useSession };
