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
  /**
   * `name` is the store listing's name, which a music pack folder or a sprite file takes so the
   * app shows what the store shows; without one (a file opened from the desktop) the pack's own.
   */
  install: (bytes: Uint8Array, files: FileStore, onProgress: (p: InstallProgress) => void, name?: string) => Promise<InstallOutcome>;
  uninstall: (installedName: string, files: FileStore) => Promise<void>;
  /**
   * Moves an installed pack to the name it should have (from the listing's name) once that name
   * is free, as it is after an update removed the version before it. Returns the name it ends
   * under. Absent where the name is not the player's to see (a language set's id).
   */
  settleName?: (installedName: string, listingName: string, files: FileStore) => Promise<string>;
};

export type { InstallPhase, InstallProgress, InstallOutcome, PackInstaller };
