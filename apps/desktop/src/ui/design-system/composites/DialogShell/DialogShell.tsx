/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Portal } from '../../primitives/Portal';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import './DialogShell.css';
import { type DialogShellProps } from './DialogShell.type';

/** Modal chrome: portal + backdrop + panel + escape/focus handling. Slots only. */
const DialogShell = (props: DialogShellProps) => {
  const { open, onClose, title, actions, className = '', initialFocusRef, children } = props;

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
          {title != null && <Text as="h3" className="dialog__title">{title}</Text>}
          {children}
          {actions && <Box className="dialog__actions">{actions}</Box>}
        </Box>
      </Box>
    </Portal>
  );
};

export { DialogShell };
