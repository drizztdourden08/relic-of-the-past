/* @layer renderer-other @kind hook */
import { useState, useEffect, useCallback } from 'react';
import type { UpdaterCapabilities, UpdaterPrefs } from '@shared/ipc/updater-contract';
import type { UpdateState } from './useAutoUpdate.type';
import { INITIAL } from './useAutoUpdate.constants';

const useAutoUpdate = () => {
  const [state, setState] = useState<UpdateState>(INITIAL);
  const [caps, setCaps] = useState<UpdaterCapabilities>({ canCheck: false, canInstall: false });

  useEffect(() => {
    window.api.updater.capabilities().then(setCaps);
    window.api.updater.getPrefs().then((prefs) => setState((s) => ({ ...s, prefs })));
    window.api.updater.getVersion().then((currentVersion) => setState((s) => ({ ...s, currentVersion })));
  }, []);

  useEffect(() => {
    if (!caps.canCheck) return;
    const cleanups: (() => void)[] = [];

    cleanups.push(window.api.updater.onUpdateAvailable((info) => {
      setState((s) => ({ ...s, status: 'available', info, error: null }));
    }));

    cleanups.push(window.api.updater.onUpToDate(() => {
      setState((s) => ({ ...s, status: 'idle' }));
    }));

    cleanups.push(window.api.updater.onDownloadProgress(({ percent }) => {
      setState((s) => ({ ...s, status: 'downloading', percent }));
    }));

    cleanups.push(window.api.updater.onDownloadComplete(() => {
      setState((s) => ({ ...s, status: 'ready', percent: 100 }));
    }));

    cleanups.push(window.api.updater.onError((error) => {
      setState((s) => ({ ...s, status: 'error', error }));
    }));

    window.api.updater.getAvailable().then((info) => {
      if (info) setState((s) => ({ ...s, status: 'available', info, error: null }));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [caps.canCheck]);

  const check = useCallback(async () => {
    setState((s) => ({ ...s, status: 'checking', error: null }));
    try {
      await window.api.updater.check();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, status: 'error', error: message }));
    }
  }, []);

  const loadVersions = useCallback(async () => {
    const versions = await window.api.updater.listVersions();
    setState((s) => ({ ...s, versions }));
  }, []);

  const setPrefs = useCallback(async (prefs: UpdaterPrefs) => {
    setState((s) => ({ ...s, prefs }));
    await window.api.updater.setPrefs(prefs);
    const versions = await window.api.updater.listVersions();
    setState((s) => ({ ...s, versions }));
  }, []);

  const apply = useCallback(async (version: string | null) => {
    setState((s) => ({ ...s, status: 'downloading', percent: 0, error: null }));
    await window.api.updater.apply(version);
  }, []);

  const openReleasePage = useCallback(async (version: string | null) => {
    await window.api.updater.openReleasePage(version);
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
