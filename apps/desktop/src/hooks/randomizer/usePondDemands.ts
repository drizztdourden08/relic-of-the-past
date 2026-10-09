/* @layer renderer-hooks @kind hook */
import { useMemo } from 'react';
import { pondDemandsOfSnapshot } from '@shared/randomizer/world/fill/pond-demands-of-snapshot';
import { NO_POND_DEMANDS } from '@shared/randomizer/world/pond/pond-demand-seed';
import { deliverableSets } from './deliverable-sets';
import type { PondDemandView } from '@shared/randomizer/world/pond/pond-ask.type';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';

const usePondDemands = (snapshot: RandomizerOptionsSnapshot, seed: string): PondDemandView => useMemo(() => {
  if (seed === '') return NO_POND_DEMANDS;
  try {
    return pondDemandsOfSnapshot(snapshot, seed, deliverableSets());
  } catch {
    return NO_POND_DEMANDS;
  }
}, [snapshot, seed]);

export { usePondDemands };
