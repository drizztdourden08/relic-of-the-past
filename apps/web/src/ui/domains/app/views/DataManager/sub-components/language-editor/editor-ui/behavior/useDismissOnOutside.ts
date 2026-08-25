/* @layer renderer-components @kind hook */
/**
 * Closes a small transient panel when a press lands anywhere outside the element
 * that owns it.
 *
 * A blur handler cannot do this job here: the toolbar deliberately swallows
 * mousedown so that focus never leaves the text being edited, which means none
 * of its buttons ever receive or lose focus from the pointer. A document-level
 * press listener is what is left, and it is also the more honest test — "did the
 * press land outside me" rather than "did something else take focus".
 *
 * The listener is attached only while the panel is open, and in the CAPTURE
 * phase, so it still sees the press the toolbar is about to swallow.
 */
import { useEffect } from 'react';
import type { RefObject } from 'react';

const useDismissOnOutside = (
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
): void => {
  useEffect(() => {
    if (!open) return undefined;

    const handlePress = (event: MouseEvent): void => {
      const node = ref.current;
      if (node && event.target instanceof Node && node.contains(event.target)) return;
      onDismiss();
    };

    document.addEventListener('mousedown', handlePress, true);
    return () => document.removeEventListener('mousedown', handlePress, true);
  }, [ref, open, onDismiss]);
};

export { useDismissOnOutside };
