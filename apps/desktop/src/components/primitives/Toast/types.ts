export type ToastVariant = 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}
