/* @layer website-site @kind component */
import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Box } from '../../primitives/Box';
import { Icon } from '../../primitives/Icon';
import { Pressable } from '../../primitives/Pressable';
import { useLightboxFocus } from './behavior/useLightboxFocus';
import { useLightboxZoom } from './behavior/useLightboxZoom';
import { useScrollLock } from './behavior/useScrollLock';
import { LIGHTBOX_TEXT, VAR_ASPECT } from './Lightbox.constants';
import type { LightboxProps } from './Lightbox.type';
import './Lightbox.css';

const Lightbox = ({ open, onClose, label, aspect, zoomable = true, children }: LightboxProps) => {
  const overlayRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  useScrollLock(open);
  useLightboxFocus(open, onClose, overlayRef, panelRef);
  const pan = useLightboxZoom(open, zoomable, { overlayRef, panelRef, contentRef });

  useLayoutEffect(() => {
    panelRef.current?.style.setProperty(VAR_ASPECT, String(aspect));
  }, [open, aspect]);

  if (!open) return null;

  return createPortal(
    <Box
      ref={overlayRef}
      className="ds-lightbox"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Box ref={panelRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className="ds-lightbox__panel">
        <Box ref={contentRef} className="ds-lightbox__content" {...pan}>
          {children}
        </Box>
      </Box>
      <Pressable className="ds-lightbox__close" aria-label={LIGHTBOX_TEXT.close} onClick={onClose}>
        <Icon name="close" size={20} />
      </Pressable>
    </Box>,
    document.body,
  );
};

export { Lightbox };
