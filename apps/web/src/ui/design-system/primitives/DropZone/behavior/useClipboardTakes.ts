/* @layer renderer-components @kind hook */
/**
 * Whether the clipboard holds content of a type the drop zone takes, such as a copied
 * picture, from the page's shared look at it (clipboard-watch.ts). A path copied as text is
 * text, so it never counts as a picture. False while the browser has not let the page look.
 */
import { useSyncExternalStore } from 'react';
import { clipboardSnapshot, subscribeClipboard } from './clipboard-watch';

const useClipboardTakes = (takesType: (type: string) => boolean): boolean => {
  const types = useSyncExternalStore(subscribeClipboard, clipboardSnapshot, () => null);
  return types?.some(takesType) ?? false;
};

export { useClipboardTakes };
