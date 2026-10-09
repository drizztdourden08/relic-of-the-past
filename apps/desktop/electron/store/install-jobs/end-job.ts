/* @layer electron-main @kind logic */
import { runningInstalls } from './running-installs';

const endJob = (itemId: string): void => {
  runningInstalls.delete(itemId);
};

export { endJob };
