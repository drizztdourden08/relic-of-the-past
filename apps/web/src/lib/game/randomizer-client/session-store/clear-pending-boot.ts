/* @layer bridge-wasm @kind logic */
import { storeSlots } from './store-slots';

const clearPendingBoot = (): void => { storeSlots.pendingBoot = null; };

export { clearPendingBoot };
