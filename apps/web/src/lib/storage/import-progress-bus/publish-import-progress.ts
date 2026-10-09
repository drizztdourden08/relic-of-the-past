/* @layer renderer-lib @kind logic */
import type { ImportProgress } from '@shared/ipc';
import { progressListeners } from './progress-listeners';

const publishImportProgress = (progress: ImportProgress): void => {
  progressListeners.forEach((listener) => listener(progress));
};

export { publishImportProgress };
