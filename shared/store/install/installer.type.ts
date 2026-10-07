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
  /**
   * The name the pack gives itself, as a folder or file name. It differs from `installedName`
   * only when that name was taken, as it is during an update while the old copy is still there.
   */
  ownName?: string;
};

type PackInstaller = {
  container: Container;
  install: (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void) => Promise<InstallOutcome>;
  uninstall: (installedName: string, files: FileStore) => Promise<void>;
  /**
   * Moves an installed pack to its own name once that name is free, as it is after an update
   * removed the version before it. Returns the name it ends under. Absent where there is
   * nothing to move (a language set keeps its id).
   */
  settleName?: (installedName: string, ownName: string, files: FileStore) => Promise<string>;
};

export type { InstallPhase, InstallProgress, InstallOutcome, PackInstaller };
