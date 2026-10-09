/* @layer renderer-components @kind logic */
import type { InstallProgress } from '@shared/store/install/installer.type';

const progressRatio = (progress: InstallProgress | null): number => {
  if (!progress || !progress.total) return 0;
  return Math.min(1, progress.done / progress.total);
};

export { progressRatio };
