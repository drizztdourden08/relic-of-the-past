/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { trapTab } from './trap-tab';

const useLightboxFocus = (
  open: boolean,
  onClose: () => void,
  overlayRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
): void => {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      } else if (event.key === 'Tab' && overlayRef.current) {
        trapTab(event, overlayRef.current);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [open, overlayRef, panelRef]);
};

export { useLightboxFocus };
