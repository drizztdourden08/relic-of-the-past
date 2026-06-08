/* @layer renderer-components @kind component */
﻿import { useEffect, useRef } from 'react';
import { Button } from '../../primitives/Button';
import { Portal } from '../../primitives/Portal';
import './Dialog.css';
import { type DialogProps } from './types';


const Dialog = (props: DialogProps) => {
  const {
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
    children,
  } = props;

  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
    };
    document.addEventListener('keydown', handler);
    confirmRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <Portal layer="modal">
      <div className="dialog-backdrop" onClick={onCancel}>
        <div className="dialog" onClick={(e) => e.stopPropagation()}>
          <h3 className="dialog__title">{title}</h3>
          {message && <p className="dialog__message">{message}</p>}
          {children}
          <div className="dialog__actions">
            <Button variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              ref={confirmRef}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export {
  Dialog,
};
