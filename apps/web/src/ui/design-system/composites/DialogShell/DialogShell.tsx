/* @layer renderer-components @kind component */
import { useEffect, useRef } from 'react';
import { Portal } from '../../primitives/Portal';
import { Box } from '../../primitives/Box';
import { WindowHeader } from '../WindowHeader';
import './DialogShell.css';
import { type DialogShellProps } from './DialogShell.type';

/** Modal chrome: portal + backdrop + panel + escape/focus handling. Slots only. */
const DialogShell = (props: DialogShellProps) => {
  const { open, onClose, title, headerExtra, actions, className = '', dismissable = true, initialFocusRef, children } = props;

  // Read via a ref so the escape listener always calls the latest onClose without
  // needing it in a dependency array — onClose is typically a fresh closure on
  // every parent render, which would otherwise re-run the effects below on every
  // keystroke inside the dialog.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || !dismissable) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, dismissable]);

  // A non-dismissable dialog has to swallow Escape outright, not merely decline
  // to act on it. The app binds its own Escape shortcut on document, which
  // closes whatever page is open, and that would tear this dialog down along
  // with the page. Capture phase runs before that listener, so stopping
  // propagation here keeps the key from reaching it at all.
  useEffect(() => {
    if (!open || dismissable) return;
    const swallow = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('keydown', swallow, true);
    return () => document.removeEventListener('keydown', swallow, true);
  }, [open, dismissable]);

  // Runs only when the dialog opens (not on every re-render). Skips stealing focus
  // if a child already claimed it — e.g. a name TextInput with its own autoFocus.
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (!active || active === document.body) {
      initialFocusRef?.current?.focus();
    }
  }, [open, initialFocusRef]);

  if (!open) return null;

  return (
    <Portal layer="modal">
      <Box className="dialog-backdrop" onClick={dismissable ? onClose : undefined}>
        <Box className={`dialog${className ? ` ${className}` : ''}`} onClick={(e) => e.stopPropagation()}>
          <WindowHeader title={title} extra={headerExtra} onClose={dismissable ? onClose : undefined} className="dialog__header" />
          {children}
          {actions && <Box className="dialog__actions">{actions}</Box>}
        </Box>
      </Box>
    </Portal>
  );
};

export { DialogShell };
