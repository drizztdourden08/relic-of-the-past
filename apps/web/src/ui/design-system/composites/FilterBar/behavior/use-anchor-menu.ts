/* @layer renderer-components @kind hook */
/** Open/close state for a trigger anchoring a portalled popover. An outside click must tolerate the trigger and the portal selector. */
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
