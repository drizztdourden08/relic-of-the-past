/* @layer renderer-components @kind types */
import type { ReactNode, RefObject } from 'react';

interface DialogShellProps {
  /** Whether the dialog is mounted/visible. */
  open: boolean;
  /** Invoked on backdrop click or Escape. */
  onClose: () => void;
  /** Optional heading rendered as the dialog title (`h3`). */
  title?: ReactNode;
  /** Optional footer action row (buttons). */
  actions?: ReactNode;
  /** Extra class for the panel (e.g. a per-dialog modifier). */
  className?: string;
  /** Element focused when the dialog opens. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  children?: ReactNode;
}

export type { DialogShellProps };
