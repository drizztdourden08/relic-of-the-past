/* @layer electron-main @kind logic */
import { runningInstalls } from './running-installs';

const beginJob = (itemId: string): AbortSignal | null => {
  if (runningInstalls.has(itemId)) return null;
  const controller = new AbortController();
  runningInstalls.set(itemId, controller);
  return controller.signal;
};

export { beginJob };
