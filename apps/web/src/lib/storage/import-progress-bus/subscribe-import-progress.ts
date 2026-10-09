/* @layer renderer-lib @kind logic */
import type { ImportProgressListener } from './import-progress-bus.type';
import { progressListeners } from './progress-listeners';

const subscribeImportProgress = (listener: ImportProgressListener): (() => void) => {
  progressListeners.add(listener);
  return () => { progressListeners.delete(listener); };
};

export { subscribeImportProgress };
