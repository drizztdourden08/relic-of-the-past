/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { getInputManager } from '../input-manager/get-input-manager';

const useInputPaused = (): boolean => {
  const [paused, setPaused] = useState(() => getInputManager().isPaused());

  useEffect(() => {
    const manager = getInputManager();
    setPaused(manager.isPaused());
    return manager.onPauseChange((next) => setPaused(next));
  }, []);

  return paused;
};

export { useInputPaused };
