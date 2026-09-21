/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface ConfirmIconButtonProps {
  /** Glyph for the resting state, before the action is armed. */
  icon: ReactNode;
  /** Accessible name and tooltip of the resting button. */
  label: string;
  /** Accessible name and tooltip of the green button. */
  confirmLabel: string;
  /** Accessible name and tooltip of the red button. */
  cancelLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}

export type {
  ConfirmIconButtonProps,
};
