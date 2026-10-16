/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { ensureGameRunning } from '../ensure-game-running';
import { gameSnapshot } from './game-snapshot';
import type { UseUndoableLoadParams } from './undo.type';

const useUndoableLoad = (params: UseUndoableLoadParams) => {
  const { isGameRunning, onStartGame, undo } = params;

  return useCallback(async (key: string, load: () => Promise<boolean>): Promise<void> => {
    const before = await gameSnapshot.capture();
    if (!(await ensureGameRunning(isGameRunning, onStartGame))) return;
    if (!(await load()) || !before) return;
    undo.offer({ key, kind: 'loaded', undo: () => gameSnapshot.restore(before) });
  }, [isGameRunning, onStartGame, undo]);
};

export { useUndoableLoad };
