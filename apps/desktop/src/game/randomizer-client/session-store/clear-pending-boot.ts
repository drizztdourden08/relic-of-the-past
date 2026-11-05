/* @layer bridge-wasm @kind logic */
import { pendingBoot } from '@drizztdourden08/brock-randomizer/session';

const clearPendingBoot = (): void => pendingBoot.clear();

export { clearPendingBoot };
