/* @layer renderer-components @kind logic */
/**
 * One look at the clipboard for the whole page, shared by every drop zone. It reads only in
 * browsers with a clipboard permission, the Chromium ones: they ask once, the first time a
 * zone is hovered, then read without asking. Firefox and Safari show their own paste menu for
 * every read, so there it never reads and the zones keep their plain Ctrl+V hint. It looks
 * again when the page gets focus back, when something is copied or cut on the page, and when
 * a zone is hovered. The snapshot is the media types on the clipboard, or null while unknown.
 */
type ClipboardSnapshot = readonly string[] | null;

/** Lets the copy finish writing before the clipboard is read back. */
const AFTER_COPY_MS = 50;

let snapshot: ClipboardSnapshot = null;
const listeners = new Set<() => void>();

const publish = (next: ClipboardSnapshot) => {
  if (next?.join() === snapshot?.join() && (next === null) === (snapshot === null)) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
};

/** The page's clipboard permission, or `unsupported` where reading always opens a paste menu. */
const readPermission = async (): Promise<PermissionState | 'unsupported'> => {
  if (!navigator.clipboard?.read || !navigator.permissions?.query) return 'unsupported';
  try {
    return (await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })).state;
  } catch {
    return 'unsupported';
  }
};

/**
 * Reads the clipboard's media types when the browser allows it. `ask` lets a Chromium browser
 * show its one-time permission prompt; without it, only an already allowed read happens.
 */
const refreshClipboard = async (ask = false) => {
  const permission = document.hasFocus() ? await readPermission() : 'unsupported';
  if (permission !== 'granted' && !(ask && permission === 'prompt')) {
    publish(null);
    return;
  }
  try {
    const items = await navigator.clipboard.read();
    publish(items.flatMap((item) => item.types));
  } catch {
    publish(null);
  }
};

const afterCopy = () => window.setTimeout(() => void refreshClipboard(), AFTER_COPY_MS);
const onFocus = () => void refreshClipboard();
const onVisible = () => {
  if (document.visibilityState === 'visible') void refreshClipboard();
};

const start = () => {
  window.addEventListener('focus', onFocus);
  window.addEventListener('copy', afterCopy);
  window.addEventListener('cut', afterCopy);
  document.addEventListener('visibilitychange', onVisible);
  void refreshClipboard();
};

const stop = () => {
  window.removeEventListener('focus', onFocus);
  window.removeEventListener('copy', afterCopy);
  window.removeEventListener('cut', afterCopy);
  document.removeEventListener('visibilitychange', onVisible);
};

const subscribeClipboard = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
};

const clipboardSnapshot = (): ClipboardSnapshot => snapshot;

export { subscribeClipboard, clipboardSnapshot, refreshClipboard };
export type { ClipboardSnapshot };
