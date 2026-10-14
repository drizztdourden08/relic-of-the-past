/* @layer renderer-widgets @kind hook */
import { useEffect, useCallback } from 'react';
import { useWidgetStateReady, useWidgetPref } from '@drizztdourden08/brock-react';
import type { NavMode } from '../../../stores/navigation-overlay-store';
import type { NavModeParams } from './hooks.type';

let didRestoreSavedMode = false;

const useNavMode = (params: NavModeParams) => {
  const { mode, running, runRef, setOverlayMode } = params;
  const [savedMode, setSavedMode] = useWidgetPref<NavMode>('navigation', 'mode', 'manual');
  const prefsHydrated = useWidgetStateReady();

  useEffect(() => {
    if (!prefsHydrated || didRestoreSavedMode) return;
    didRestoreSavedMode = true;
    if (savedMode !== mode) setOverlayMode(savedMode);
  }, [prefsHydrated, savedMode, mode, setOverlayMode]);

  const setMode = useCallback((next: NavMode) => {
    setOverlayMode(next);
    setSavedMode(next);
    if (next === 'auto' && !running) runRef.current?.();
  }, [running, setSavedMode, setOverlayMode, runRef]);

  return setMode;
};

export { useNavMode };
