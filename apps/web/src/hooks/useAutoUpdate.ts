/* @layer renderer-other @kind hook */
import { useState, useEffect, useCallback } from 'react';
import type { UpdateInfo, UpdaterCapabilities, UpdaterPrefs, VersionOption } from '@shared/ipc/updater-contract';

interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';
  info: UpdateInfo | null;
  /** Percent of the package downloaded, while status is 'downloading'. */
  percent: number;
  error: string | null;
  /** Every installable release, newest first. Empty until the picker is opened. */
  versions: VersionOption[];
  prefs: UpdaterPrefs;
  /** What is running, so the dialog can name it and label the action correctly. */
  currentVersion: string;
}

const INITIAL: UpdateState = {
  status: 'idle',
  info: null,
  percent: 0,
  error: null,
  versions: [],
  prefs: { allowPrerelease: false },
  currentVersion: '',
};

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

    // An update may have been found before this mounted.
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

  /** Fills the picker. Kept separate from the check so opening the dialog is cheap. */
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

  /** `null` takes the newest release; a version string takes that exact build. */
  const apply = useCallback(async (version: string | null) => {
    setState((s) => ({ ...s, status: 'downloading', percent: 0, error: null }));
    await window.api.updater.apply(version);
  }, []);

  /** The way out where the app can see an update but not install it. */
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
