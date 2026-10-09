/* @layer bridge-wasm @kind logic */
import type { DeliveryEntry } from '../delivery-queue/delivery-queue.type';
import type { ExecuteOutcome } from './delivery-execute.type';
import { executeAction } from './execute-action';

const fireGranted = (entry: DeliveryEntry): void => {
  try { entry.onGranted?.(); } catch {  }
};

const executeEntry = (entry: DeliveryEntry): ExecuteOutcome => {
  const outcome = executeAction(entry.action);
  if (outcome !== 'refused') fireGranted(entry);
  return outcome;
};

export { executeEntry };
