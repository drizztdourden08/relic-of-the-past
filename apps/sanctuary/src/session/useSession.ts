/* @layer sanctuary-site @kind hook */
/**
 * Loads GET /me once on mount and keeps the answer. A 401 is a signed-out visitor, not an
 * error; anything else is kept as the error message so the page can say the API is down.
 */
import { useCallback, useEffect, useState } from 'react';
import type { SanctuaryUser, Identity } from '@shared/sanctuary/types';
import type { Group, Rights } from '@shared/sanctuary/group-types';
import { getMe, signOut as signOutRequest } from '../api/endpoints';
import { ApiError, errorMessage } from '../api/client';
import type { Session } from './session-context';

type SessionState = {
  me: SanctuaryUser | null;
  identities: Identity[];
  groups: Group[];
  rights: Rights | null;
  loading: boolean;
  error: string | null;
};

const SIGNED_OUT: SessionState = { me: null, identities: [], groups: [], rights: null, loading: false, error: null };

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
