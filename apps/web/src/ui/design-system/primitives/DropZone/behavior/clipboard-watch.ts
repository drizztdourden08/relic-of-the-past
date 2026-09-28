/* @layer renderer-components @kind logic */
/**
 * One look at the clipboard for the whole page, shared by every drop zone. It reads only
 * when the browser lets the page read without asking, so no prompt or paste menu ever opens
 * on its own: Chromium browsers once the viewer has allowed it, never Firefox or Safari,
 * which show their own paste menu for every read. It looks again when the page gets focus
 * back, when something is copied or cut on the page, and when a zone asks. The snapshot is
 * the media types on the clipboard, or null while they are not known.
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

const readsSilently = async (): Promise<boolean> => {
  if (!navigator.clipboard?.read || !navigator.permissions?.query) return false;
  try {
    const status = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
    return status.state === 'granted';
  } catch {
    return false;
  }
};

/** Reads the clipboard's media types when that needs no prompt; otherwise they stay unknown. */
const refreshClipboard = async () => {
  if (!document.hasFocus() || !(await readsSilently())) {
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
