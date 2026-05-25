import { useState, useEffect, useCallback } from 'react';

export interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';
  info: { version: string; releaseNotes: string; releaseDate: string } | null;
  progress: { percent: number; bytesPerSecond: number; transferred: number; total: number } | null;
  error: string | null;
}

export function useAutoUpdate() {
  const [state, setState] = useState<UpdateState>({
    status: 'idle',
    info: null,
    progress: null,
    error: null,
  });

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    cleanups.push(window.api.updater.onUpdateAvailable((info) => {
      setState({ status: 'available', info, progress: null, error: null });
    }));

    cleanups.push(window.api.updater.onUpToDate(() => {
      setState((s) => ({ ...s, status: 'idle' }));
    }));

    cleanups.push(window.api.updater.onDownloadProgress((progress) => {
      setState((s) => ({ ...s, status: 'downloading', progress }));
    }));

    cleanups.push(window.api.updater.onDownloadComplete(() => {
      setState((s) => ({ ...s, status: 'ready', progress: null }));
    }));

    cleanups.push(window.api.updater.onError((error) => {
      setState((s) => ({ ...s, status: 'error', error }));
    }));

    // Check if an update was already detected before this component mounted
    window.api.updater.getAvailable().then((info) => {
      if (info) {
        setState({ status: 'available', info, progress: null, error: null });
      }
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const check = useCallback(async () => {
    setState((s) => ({ ...s, status: 'checking' }));
    await window.api.updater.check();
  }, []);

  const download = useCallback(async () => {
    setState((s) => ({ ...s, status: 'downloading', progress: null }));
    await window.api.updater.download();
  }, []);

  const install = useCallback(() => {
    window.api.updater.install();
  }, []);

  return { ...state, check, download, install };
}
