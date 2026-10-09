/* @layer shared-game @kind types */
import type { LocationRecord } from '../../../data';

interface Candidate {
  pick: LocationRecord | undefined;
  count: number;
}

export type { Candidate };
