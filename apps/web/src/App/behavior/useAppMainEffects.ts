/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { getInputManager } from '@app/lib/game';
import type { PageId } from '../types';

const useAppMainEffects = (params: {
  isGameRunning: boolean;
  activePage: PageId;
  openNavWidget: () => void;
}) => {
  const { isGameRunning, activePage, openNavWidget } = params;

  // Auto-open navigation widget when --auto-flood CLI flag is set (once, on mount).
  useEffect(() => {
    if (window.api.autoFlood) openNavWidget();
  }, []);

  // Input suppression: disable game input when menus/overlays are open.
  useEffect(() => {
    const gameActive = isGameRunning && activePage === 'none';
    getInputManager().setInputSuppressed(!gameActive);
  }, [isGameRunning, activePage]);
};

export { useAppMainEffects };
