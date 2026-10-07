/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/** 'bare' is a plain surface with no tint: the content brings its own look. */
type ToastVariant = 'danger' | 'warning' | 'info' | 'success' | 'bare';

type ToastPosition = 'bottom-right' | 'bottom-left';

interface ToastItem {
  id: string;
  message: string;
  /** Shown in place of the message; the message stays as the accessible label. */
  content?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: ToastPosition;
  /** Placed inside the nearest positioned parent, not over the whole window. */
  anchored?: boolean;
}

export type {
  ToastContainerProps,
  ToastItem,
  ToastPosition,
  ToastProps,
  ToastVariant
};
