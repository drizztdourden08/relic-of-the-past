/* @layer renderer-lib @kind logic */
/**
 * Renderer import-progress bus. Import now runs in the renderer (over FileStore),
 * so progress is published here instead of arriving as a main-process IPC event;
 * useImportProgress subscribes to it.
 */
import type { ImportProgress } from '@shared/ipc';

type Listener = (progress: ImportProgress) => void;

const listeners = new Set<Listener>();

const publishImportProgress = (progress: ImportProgress): void => {
  listeners.forEach((listener) => listener(progress));
};

const subscribeImportProgress = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export { publishImportProgress, subscribeImportProgress };
