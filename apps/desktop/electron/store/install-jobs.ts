/* @layer electron-main @kind logic */
/**
 * The installs running now, one per item. A second request for an item that is already
 * installing is refused, and cancel finds the install's controller here.
 */

const running = new Map<string, AbortController>();

/** The new install's signal, or null when that item is already installing. */
const beginJob = (itemId: string): AbortSignal | null => {
  if (running.has(itemId)) return null;
  const controller = new AbortController();
  running.set(itemId, controller);
  return controller.signal;
};

const endJob = (itemId: string): void => {
  running.delete(itemId);
};

const cancelJob = (itemId: string): void => {
  running.get(itemId)?.abort();
};

const isInstalling = (itemId: string): boolean => running.has(itemId);

export { beginJob, endJob, cancelJob, isInstalling };
