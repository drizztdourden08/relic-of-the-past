/* @layer sanctuary-site @kind hook */
/**
 * The Account page's calls that change the session: re-check access, unlink a provider,
 * sign out here or everywhere. One busy flag and one error line cover all of them.
 */
import { useCallback, useState } from 'react';
import type { Provider } from '@shared/sanctuary/providers';
import { recheckAccess, unlinkProvider } from '../../../api/endpoints';
import { errorMessage } from '../../../api/client';
import { useSessionContext } from '../../../session/session-context';

const useAccountActions = () => {
  const { refresh, signOut } = useSessionContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  const recheck = useCallback(() => run(async () => {
    await recheckAccess();
    await refresh();
  }), [run, refresh]);

  const unlink = useCallback((provider: Provider) => run(async () => {
    await unlinkProvider(provider);
    await refresh();
  }), [run, refresh]);

  const signOutHere = useCallback(() => run(() => signOut(false)), [run, signOut]);
  const signOutEverywhere = useCallback(() => run(() => signOut(true)), [run, signOut]);

  return { busy, error, recheck, unlink, signOutHere, signOutEverywhere };
};

export { useAccountActions };
