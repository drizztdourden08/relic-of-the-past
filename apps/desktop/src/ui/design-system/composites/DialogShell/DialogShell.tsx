/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Portal } from '../../primitives/Portal';
import { Box } from '../../primitives/Box';
import { WindowHeader } from '../WindowHeader';
import './DialogShell.css';
import { type DialogShellProps } from './DialogShell.type';

/** Modal chrome: portal + backdrop + panel + escape/focus handling. Slots only. */
const DialogShell = (props: DialogShellProps) => {
  const { open, onClose, title, headerExtra, actions, className = '', initialFocusRef, children } = props;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handler);
    initialFocusRef?.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <Portal layer="modal">
      <Box className="dialog-backdrop" onClick={onClose}>
        <Box className={`dialog${className ? ` ${className}` : ''}`} onClick={(e) => e.stopPropagation()}>
          <WindowHeader title={title} extra={headerExtra} onClose={onClose} className="dialog__header" />
          {children}
          {actions && <Box className="dialog__actions">{actions}</Box>}
        </Box>
      </Box>
    </Portal>
  );
};

export { DialogShell };
