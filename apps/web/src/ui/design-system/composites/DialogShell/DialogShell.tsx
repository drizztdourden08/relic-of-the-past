/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Portal, useDismissable } from '../../primitives/Portal';
import { Box } from '../../primitives/Box';
import { WindowHeader } from '../WindowHeader';
import './DialogShell.css';
import { type DialogShellProps } from './DialogShell.type';

const noop = (): void => undefined;

/** Modal chrome: portal + backdrop + panel + escape/focus handling. Slots only. */
const DialogShell = (props: DialogShellProps) => {
  const { open, onClose, title, headerExtra, actions, className = '', dismissable = true, initialFocusRef, children } = props;

  // Escape is owned by the shared dismiss stack, not by a listener of this
  // component's own. Two things follow from that, and both used to be bugs:
  //
  //  - A dialog opened over a full-screen page no longer closes the page as
  //    well. Both bound bubble-phase listeners on `document`, so both fired and
  //    registration order decided nothing.
  //  - A NON-dismissable dialog still registers, with a handler that does
  //    nothing. Sitting on the stack IS the swallow: the stack notifies only its
  //    top entry, so the page underneath never hears the key. That replaces the
  //    capture-phase `stopPropagation` hack this component used to carry, which
  //    worked only as long as it happened to be registered first.
  useDismissable({ active: open, level: 'dialog', onDismiss: dismissable ? onClose : noop });

  // Runs only when the dialog opens (not on every re-render). Skips stealing focus
  // if a child already claimed it, such as a name TextInput with its own autoFocus.
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
