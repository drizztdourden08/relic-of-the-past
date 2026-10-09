/* @layer renderer-components @kind logic */
import type { InstallProgress } from '@shared/store/install/installer.type';
import { formatBytes } from '@app/utils';

const progressLine = (progress: InstallProgress | null): string => {
  if (!progress) return 'Asking the Hookshop for the download';
  const { phase, done, total } = progress;
  if (phase === 'download') {
    return total ? `Downloading · ${formatBytes(done)} of ${formatBytes(total)}` : `Downloading · ${formatBytes(done)}`;
  }
  if (phase === 'verify') return 'Checking the download';
  return total ? `Unpacking · ${done} of ${total}` : 'Unpacking';
};

export { progressLine };
