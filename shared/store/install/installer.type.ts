/* @layer shared-store @kind types */
/**
 * One installer per container, all working on the FileStore port alone, so the same code runs
 * in Electron main and on Android. Each one's uninstall removes exactly what its install
 * wrote, found again by `installedName`.
 */
import type { FileStore } from '@shared/platform';
import type { Container } from '../types';

type InstallPhase = 'download' | 'verify' | 'unpack';

/** `total` is null while a download does not know its size yet. */
type InstallProgress = { phase: InstallPhase; done: number; total: number | null };

type InstallOutcome = {
  /** The music pack folder, the sprite file name, or the language set id. */
  installedName: string;
};

type PackInstaller = {
  container: Container;
  install: (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void) => Promise<InstallOutcome>;
  uninstall: (installedName: string, files: FileStore) => Promise<void>;
};

export type { InstallPhase, InstallProgress, InstallOutcome, PackInstaller };
