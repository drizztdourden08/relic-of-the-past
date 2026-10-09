/* @layer bridge-wasm @kind logic */
import { storeSlots } from './store-slots';
import type { PendingBoot } from './session-store.type';

const setPendingBoot = (next: PendingBoot): void => { storeSlots.pendingBoot = next; };

export { setPendingBoot };
