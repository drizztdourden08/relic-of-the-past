/* @layer electron-main @kind types */
import type { InstallProgress } from '@shared/store/install/installer.type';

type InstallParams = {
  itemId: string;
  version: number | null;
  onProgress: (progress: InstallProgress) => void;
  signal: AbortSignal;
};

export type { InstallParams };
