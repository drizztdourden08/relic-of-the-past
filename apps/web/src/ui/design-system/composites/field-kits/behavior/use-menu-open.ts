/* @layer renderer-components @kind hook */
/**
 * Open/close state for a trigger that anchors a portalled menu. The menu is
 * rendered elsewhere in the DOM, so an outside click has to allow for both the
 * trigger and the portal — the same two-part check the title bar menu uses.
 */
import { useEffect, useRef, useState } from 'react';

const MENU_SELECTOR = '.dropdown-menu';

const useMenuOpen = <T extends HTMLElement>() => {
  const anchorRef = useRef<T>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if ((target as Element).closest?.(MENU_SELECTOR)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  return {
    anchorRef,
    open,
    toggle: () => setOpen((wasOpen) => !wasOpen),
    close: () => setOpen(false),
  };
};

export { useMenuOpen };
