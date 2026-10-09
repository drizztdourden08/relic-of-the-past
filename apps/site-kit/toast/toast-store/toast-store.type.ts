/* @layer site-kit @kind types */
import type { ToastItem } from '@ds/primitives/Toast';

type ToastInput = Omit<ToastItem, 'id'>;

type ToastState = {
  toasts: ToastItem[];
  nextId: number;
  listeners: Set<() => void>;
};

export type { ToastInput, ToastState };
