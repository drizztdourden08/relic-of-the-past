/* @layer bridge-wasm @kind types */
import type { CheckId, CheckStatus } from '@rotp/game-data';

interface TrackerReading {
  statuses: Map<CheckId, CheckStatus>;
  reachableScreens: Set<string>;
}

export type { TrackerReading };
