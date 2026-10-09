/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { getInputManager } from '@app/lib/game';
import { applyNotchMode } from '@app/hooks/useSafeAreaInsets';
import type { PageId } from '../App.type';

const useAppMainEffects = (params: {
  isGameRunning: boolean;
  activePage: PageId;
  openNavWidget: () => void;
}) => {
  const { isGameRunning, activePage, openNavWidget } = params;

  useEffect(() => { applyNotchMode(true); }, []);

  useEffect(() => {
    if (window.api.autoFlood) openNavWidget();
  }, []);

  useEffect(() => {
    const gameActive = isGameRunning && activePage === 'none';
    getInputManager().setInputSuppressed(!gameActive);
  }, [isGameRunning, activePage]);
};

export { useAppMainEffects };
