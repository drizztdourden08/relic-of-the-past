/* @layer site-kit @kind hook */
import { useCallback, useState } from 'react';
import type { Provider } from '@rotp/hub-contracts';
import { recheckAccess, unlinkProvider } from '@rotp/hub-client';
import { errorMessage } from '@rotp/hub-client';
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
