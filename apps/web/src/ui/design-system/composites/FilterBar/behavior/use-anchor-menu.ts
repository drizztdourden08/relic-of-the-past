/* @layer renderer-components @kind hook */
/**
 * Open/close state for a trigger that anchors a portalled popover — the
 * operator dropdown and the add-filter field picker both need one. An outside
 * click has to tolerate both the trigger and whatever selector the portal
 * content renders under, since the portal sits elsewhere in the DOM.
 */
import { useEffect, useRef, useState } from 'react';

const useAnchorMenu = <T extends HTMLElement>(portalSelector: string) => {
  const anchorRef = useRef<T>(null);
  const [open, setOpen] = useState(false);

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
    close: () => setOpen(false),
  };
};

export { useAnchorMenu };
