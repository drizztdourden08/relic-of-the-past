/* @layer renderer-components @kind types */
type ToastVariant = 'danger' | 'warning' | 'info' | 'success';

type ToastPosition = 'bottom-right' | 'bottom-left';

interface ToastItem {
  id: string;
  message: string;
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
}

export type {
  ToastContainerProps,
  ToastItem,
  ToastPosition,
  ToastProps,
  ToastVariant
};
