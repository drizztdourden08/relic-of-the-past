/* @layer shared-store @kind types */
import type { FileStore } from '@shared/platform';
import type { Container } from '../types';

type InstallPhase = 'download' | 'verify' | 'unpack';

type InstallProgress = { phase: InstallPhase; done: number; total: number | null };

type InstallOutcome = {
  installedName: string;
  ownName?: string;
};

type PackInstaller = {
  container: Container;
  install: (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void) => Promise<InstallOutcome>;
  uninstall: (installedName: string, files: FileStore) => Promise<void>;
  settleName?: (installedName: string, ownName: string, files: FileStore) => Promise<string>;
};

export type { InstallPhase, InstallProgress, InstallOutcome, PackInstaller };
