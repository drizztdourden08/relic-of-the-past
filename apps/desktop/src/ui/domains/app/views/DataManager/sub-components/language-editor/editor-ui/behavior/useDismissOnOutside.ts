/* @layer renderer-components @kind hook */
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
