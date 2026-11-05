/* @layer bridge-wasm @kind logic */
import type { PlanCounts } from '@rotp/randomizer';

const localStats: { current: PlanCounts | null } = { current: null };

export { localStats };
