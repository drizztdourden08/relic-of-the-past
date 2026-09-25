/* @layer renderer-components @kind hook */
/** Open/close state for a trigger anchoring a portalled popover. An outside click must tolerate the trigger and the portal selector. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable } from '@ds/primitives/Portal';

const useAnchorMenu = <T extends HTMLElement>(portalSelector: string) => {
  const anchorRef = useRef<T>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Escape closes the popover, and only the popover. Before the dismiss stack
  // it closed whatever page the filter bar was sitting on instead.
  useDismissable({ active: open, level: 'menu', onDismiss: close });

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if ((target as Element).closest?.(portalSelector)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, portalSelector]);

  return {
    anchorRef,
    open,
    toggle: () => setOpen((wasOpen) => !wasOpen),
    close,
  };
};

export { useAnchorMenu };
