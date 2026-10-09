/* @layer renderer-components @kind logic */
import { getGameState, isCoreReady, whenCoreReady } from '../../../../game';
import { BOOT_WAIT_MS } from './home-tab.constants';

const ensureGameRunning = async (isGameRunning: boolean, onStartGame: () => void): Promise<boolean> => {
  if (isCoreReady()) return true;
  if (!isGameRunning && getGameState().status === 'idle') onStartGame();
  return whenCoreReady(BOOT_WAIT_MS);
};

export { ensureGameRunning };
