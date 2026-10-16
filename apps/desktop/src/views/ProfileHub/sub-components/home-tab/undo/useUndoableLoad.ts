/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { toast } from '@drizztdourden08/tessera/composites';
import { LOADED_TOAST_ID, UNDO_WINDOW_MS } from '../home-tab.constants';
import { ensureGameRunning } from '../ensure-game-running';
import { gameSnapshot } from './game-snapshot';
import { runQuietly } from './run-quietly';
import type { UseUndoableLoadParams } from './undo.type';

const useUndoableLoad = (params: UseUndoableLoadParams) => {
  const { isGameRunning, onStartGame } = params;

  return useCallback(async (message: string, load: () => Promise<boolean>): Promise<void> => {
    const before = await gameSnapshot.capture();
    if (!(await ensureGameRunning(isGameRunning, onStartGame))) return;
    if (!(await load()) || !before) return;
    toast({
      id: LOADED_TOAST_ID,
      message,
      duration: UNDO_WINDOW_MS,
      undo: () => void runQuietly(() => gameSnapshot.restore(before), 'undo the change'),
    });
  }, [isGameRunning, onStartGame]);
};

export { useUndoableLoad };
