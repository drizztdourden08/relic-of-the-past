/* @layer renderer-components @kind hook */
/** Tracks the running game's pause state from the InputManager and toggles it. */
import { useCallback, useEffect, useState } from 'react';
import { getInputManager } from '../../../../../../lib/game';

const useGamePause = (isGameRunning: boolean) => {
  const [gamePaused, setGamePaused] = useState(false);

  useEffect(() => {
    if (!isGameRunning) {
      setGamePaused(false);
      return;
    }
    const inputMgr = getInputManager();
    setGamePaused(inputMgr.isPaused());
    return inputMgr.onPauseChange((paused) => setGamePaused(paused));
  }, [isGameRunning]);

  const handleTogglePause = useCallback(() => {
    const inputMgr = getInputManager();
    if (inputMgr.isPaused()) inputMgr.resume();
    else inputMgr.togglePause();
  }, []);

  return { gamePaused, handleTogglePause };
};

export { useGamePause };
