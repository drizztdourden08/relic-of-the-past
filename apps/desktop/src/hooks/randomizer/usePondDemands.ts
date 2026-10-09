/* @layer renderer-hooks @kind hook */
import { useMemo } from 'react';
import { pondDemandsOfSnapshot } from '@rotp/randomizer';
import { NO_POND_DEMANDS } from '@rotp/randomizer';
import { deliverableSets } from './deliverable-sets';
import type { PondDemandView } from '@rotp/randomizer';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';

const usePondDemands = (snapshot: RandomizerOptionsSnapshot, seed: string): PondDemandView => useMemo(() => {
  if (seed === '') return NO_POND_DEMANDS;
  try {
    return pondDemandsOfSnapshot(snapshot, seed, deliverableSets());
  } catch {
    return NO_POND_DEMANDS;
  }
}, [snapshot, seed]);

export { usePondDemands };
