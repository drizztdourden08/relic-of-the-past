/* @layer bridge-wasm @kind types */
import type { CheckId } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';

interface TrackerReading {
  statuses: Map<CheckId, CheckStatus>;
  reachableScreens: Set<string>;
}

export type { TrackerReading };
