/* @layer shared-game @kind types */
import type { LocationRecord } from '@rotp/game-data';

interface Candidate {
  pick: LocationRecord | undefined;
  count: number;
}

export type { Candidate };
