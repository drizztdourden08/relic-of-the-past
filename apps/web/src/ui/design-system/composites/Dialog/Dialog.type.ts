/* @layer renderer-components @kind types */
﻿interface DialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  hideCancel?: boolean;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export type {
  DialogProps,
};
