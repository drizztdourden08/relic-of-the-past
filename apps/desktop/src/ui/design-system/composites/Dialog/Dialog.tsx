/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Button } from '../../primitives/Button';
import { Text } from '../../primitives/Text';
import { DialogShell } from '../DialogShell';
import './Dialog.css';
import { type DialogProps } from './Dialog.type';

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

  const actions = (
    <>
      <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
      <Button ref={confirmRef} variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onCancel} title={title} actions={actions} initialFocusRef={confirmRef}>
      {message && <Text as="p" className="dialog__message">{message}</Text>}
      {children}
    </DialogShell>
  );
};

export {
  Dialog,
};
