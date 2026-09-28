/* @layer renderer-components @kind hook */
/**
 * What the clipboard means for one drop zone, from the page's shared look at it
 * (clipboard-watch.ts): `ready` when it holds content of a type the zone takes, such as a
 * copied picture, `empty` when it holds none, `unknown` while the browser has not let the
 * page look. A path copied as text is text, so it never counts as a picture. `paste` reads
 * the clipboard and hands the first item the zone takes to `onFiles`.
 */
import { useCallback, useSyncExternalStore } from 'react';
import { clipboardSnapshot, refreshClipboard, subscribeClipboard } from './clipboard-watch';

type ClipboardState = 'unknown' | 'ready' | 'empty';

/** The clipboard's first item the zone takes, as a file, or null. */
const pasteable = async (takesType: (type: string) => boolean): Promise<File | null> => {
  for (const item of await navigator.clipboard.read()) {
    const type = item.types.find(takesType);
    if (type) return new File([await item.getType(type)], `pasted.${type.split('/')[1] ?? 'bin'}`, { type });
  }
  return null;
};

const stateOf = (types: readonly string[] | null, takesType: (type: string) => boolean): ClipboardState => {
  if (types === null) return 'unknown';
  return types.some(takesType) ? 'ready' : 'empty';
};

const useClipboardButton = (takesType: (type: string) => boolean, onFiles: (files: File[]) => void) => {
  const types = useSyncExternalStore(subscribeClipboard, clipboardSnapshot, () => null);

  const paste = useCallback(async () => {
    try {
      const file = await pasteable(takesType);
      if (file) onFiles([file]);
    } catch {
      // the viewer declined the browser's prompt, or the browser refused the read
    }
    void refreshClipboard();
  }, [takesType, onFiles]);

  return { state: stateOf(types, takesType), paste };
};

export { useClipboardButton };
export type { ClipboardState };
