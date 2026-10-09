/* @layer renderer-components @kind logic */
import { getInputManager } from '../../../../../../lib/game';

const withPauseGuard = async (action: () => Promise<boolean>): Promise<boolean> => {
  const inputMgr = getInputManager();
  const wasPaused = inputMgr.isPaused();
  if (wasPaused) {
    inputMgr.resume();
    await new Promise(r => requestAnimationFrame(r));
  }
  const result = await action();
  if (wasPaused) {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    inputMgr.togglePause();
  }
  return result;
};

export { withPauseGuard };
