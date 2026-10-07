/* @layer renderer-components @kind logic */
/** What a running install shows: how full its bar is and one line saying which step it is on. */
import type { InstallProgress } from '@shared/store/install/installer.type';
import { formatBytes } from '@app/utils';

/** 0 to 1; a step whose size is not known yet reads as empty. */
const progressRatio = (progress: InstallProgress | null): number => {
  if (!progress || !progress.total) return 0;
  return Math.min(1, progress.done / progress.total);
};

const progressLine = (progress: InstallProgress | null): string => {
  if (!progress) return 'Asking the Hookshop for the download';
  const { phase, done, total } = progress;
  if (phase === 'download') {
    return total ? `Downloading · ${formatBytes(done)} of ${formatBytes(total)}` : `Downloading · ${formatBytes(done)}`;
  }
  if (phase === 'verify') return 'Checking the download';
  return total ? `Unpacking · ${done} of ${total}` : 'Unpacking';
};

export { progressRatio, progressLine };
