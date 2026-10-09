/* @layer site-kit @kind types */
import type { ToastItem } from '@drizztdourden08/tessera/composites';

type ToastInput = Omit<ToastItem, 'id'>;

type ToastState = {
  toasts: ToastItem[];
  nextId: number;
  listeners: Set<() => void>;
};

export type { ToastInput, ToastState };
