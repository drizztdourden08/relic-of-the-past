/* @layer bridge-wasm @kind logic */
import { pendingBoot } from '@drizztdourden08/brock-randomizer/session';
import type { PendingBoot } from '@drizztdourden08/brock-randomizer/session';

const getPendingBoot = (): PendingBoot | null => pendingBoot.get();

export { getPendingBoot };
