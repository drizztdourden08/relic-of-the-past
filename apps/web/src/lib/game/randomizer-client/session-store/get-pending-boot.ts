/* @layer bridge-wasm @kind logic */
import { storeSlots } from './store-slots';
import type { PendingBoot } from './session-store.type';

const getPendingBoot = (): PendingBoot | null => storeSlots.pendingBoot;

export { getPendingBoot };
