type ToastVariant = 'danger' | 'warning' | 'info';

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
}

export type {
  ToastContainerProps,
  ToastItem,
  ToastProps,
  ToastVariant
};
