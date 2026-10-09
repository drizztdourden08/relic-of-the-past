/* @layer bridge-wasm @kind logic */
import type { DeliveryEntry } from './delivery-queue.type';

const fireComplete = (entry: DeliveryEntry): void => {
  try { entry.onComplete?.(); } catch { return; }
};

export { fireComplete };
