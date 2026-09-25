/* @layer renderer-components @kind hook */
/**
 * Open/close state for a trigger that anchors a portalled menu. The menu is
 * rendered elsewhere in the DOM, so an outside click has to allow for both the
 * trigger and the portal, the same two-part check the title bar menu uses.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable } from '@ds/primitives/Portal';

const MENU_SELECTOR = '.dropdown-menu';

const useMenuOpen = <T extends HTMLElement>() => {
  const anchorRef = useRef<T>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Escape closed nothing here before: the key fell through to the app shell,
  // which shut the whole page the table was on. Registering at `menu` makes one
  // press close the menu and stop there.
  useDismissable({ active: open, level: 'menu', onDismiss: close });

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
    close,
  };
};

export { useMenuOpen };
