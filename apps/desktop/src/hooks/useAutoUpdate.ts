/* @layer renderer-other @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useState, useEffect, useCallback } from 'react';
import type { UpdaterCapabilities, UpdaterPrefs } from '@shared/ipc/updater-contract';
import type { UpdateState } from './use-auto-update.type';
import { INITIAL } from './use-auto-update.constants';

const useAutoUpdate = () => {
  const [state, setState] = useState<UpdateState>(INITIAL);
  const [caps, setCaps] = useState<UpdaterCapabilities>({ canCheck: false, canInstall: false });

  useEffect(() => {
    appApi().updater.capabilities().then(setCaps);
    appApi().updater.getPrefs().then((prefs) => setState((s) => ({ ...s, prefs })));
    appApi().updater.getVersion().then((currentVersion) => setState((s) => ({ ...s, currentVersion })));
  }, []);

  useEffect(() => {
    if (!caps.canCheck) return;
    const cleanups: (() => void)[] = [];

    cleanups.push(appApi().updater.onUpdateAvailable((info) => {
      setState((s) => ({ ...s, status: 'available', info, error: null }));
    }));

    cleanups.push(appApi().updater.onUpToDate(() => {
      setState((s) => ({ ...s, status: 'idle' }));
    }));

    cleanups.push(appApi().updater.onDownloadProgress(({ percent }) => {
      setState((s) => ({ ...s, status: 'downloading', percent }));
    }));

    cleanups.push(appApi().updater.onDownloadComplete(() => {
      setState((s) => ({ ...s, status: 'ready', percent: 100 }));
    }));

    cleanups.push(appApi().updater.onError((error) => {
      setState((s) => ({ ...s, status: 'error', error }));
    }));

    appApi().updater.getAvailable().then((info) => {
      if (info) setState((s) => ({ ...s, status: 'available', info, error: null }));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [caps.canCheck]);

  const check = useCallback(async () => {
    setState((s) => ({ ...s, status: 'checking', error: null }));
    try {
      await appApi().updater.check();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, status: 'error', error: message }));
    }
  }, []);

  const loadVersions = useCallback(async () => {
    const versions = await appApi().updater.listVersions();
    setState((s) => ({ ...s, versions }));
  }, []);

  const setPrefs = useCallback(async (prefs: UpdaterPrefs) => {
    setState((s) => ({ ...s, prefs }));
    await appApi().updater.setPrefs(prefs);
    const versions = await appApi().updater.listVersions();
    setState((s) => ({ ...s, versions }));
  }, []);

  const apply = useCallback(async (version: string | null) => {
    setState((s) => ({ ...s, status: 'downloading', percent: 0, error: null }));
    await appApi().updater.apply(version);
  }, []);

  const openReleasePage = useCallback(async (version: string | null) => {
    await appApi().updater.openReleasePage(version);
  }, []);

  return {
    ...state,
    supported: caps.canCheck,
    canInstall: caps.canInstall,
    check,
    loadVersions,
    setPrefs,
    apply,
    openReleasePage,
  };
};

export { useAutoUpdate };
export type { UpdateState };
