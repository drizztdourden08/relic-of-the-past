/* @layer electron-main @kind logic */
import { runningInstalls } from './running-installs';

const cancelJob = (itemId: string): void => {
  runningInstalls.get(itemId)?.abort();
};

export { cancelJob };
