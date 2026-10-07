/* @layer site-kit @kind logic */
/**
 * The site's toasts: one list for the whole page, outside React, so any hook or handler can
 * show one and the ToastLayer the frame mounts draws them. A toast leaves on its own after
 * its duration (the design-system Toast times it) or when its close button is pressed.
 */
import type { ToastItem } from '@ds/primitives/Toast';

type ToastInput = Omit<ToastItem, 'id'>;

/** How long a toast stays when the caller does not say. */
const DEFAULT_DURATION_MS = 6000;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

const publish = (next: ToastItem[]) => {
  toasts = next;
  listeners.forEach((listener) => listener());
};

const showToast = (input: ToastInput): string => {
  const id = `toast-${nextId++}`;
  publish([...toasts, { duration: DEFAULT_DURATION_MS, ...input, id }]);
  return id;
};

const dismissToast = (id: string) => publish(toasts.filter((toast) => toast.id !== id));

const subscribeToasts = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const toastsSnapshot = (): ToastItem[] => toasts;

export { showToast, dismissToast, subscribeToasts, toastsSnapshot };
export type { ToastInput };
