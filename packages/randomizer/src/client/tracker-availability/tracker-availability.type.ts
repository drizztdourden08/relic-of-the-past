/* @layer bridge-wasm @kind types */
import type { CheckId } from '@rotp/game-data';
import type { CheckStatus } from '@rotp/game-data';

interface TrackerReading {
  statuses: Map<CheckId, CheckStatus>;
  reachableScreens: Set<string>;
}

export type { TrackerReading };
