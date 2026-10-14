/* @layer bridge-wasm @kind logic */
import type { SramSync } from '@drizztdourden08/brock-port-kit/renderer';

const sramSyncHolder: { current: SramSync | null } = { current: null };

export { sramSyncHolder };
