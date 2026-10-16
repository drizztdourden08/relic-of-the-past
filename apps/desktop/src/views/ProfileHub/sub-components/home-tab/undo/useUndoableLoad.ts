/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { LOADED_TOAST_ID } from '../home-tab.constants';
import { ensureGameRunning } from '../ensure-game-running';
import { gameSnapshot } from './game-snapshot';
import { offerUndo } from './offer-undo';
import type { UseUndoableLoadParams } from './undo.type';

const useUndoableLoad = (params: UseUndoableLoadParams) => {
  const { isGameRunning, onStartGame } = params;

  return useCallback(async (message: string, load: () => Promise<boolean>): Promise<void> => {
    const before = await gameSnapshot.capture();
    if (!(await ensureGameRunning(isGameRunning, onStartGame))) return;
    if (!(await load()) || !before) return;
    offerUndo({ id: LOADED_TOAST_ID, message, undo: () => gameSnapshot.restore(before) });
  }, [isGameRunning, onStartGame]);
};

export { useUndoableLoad };
