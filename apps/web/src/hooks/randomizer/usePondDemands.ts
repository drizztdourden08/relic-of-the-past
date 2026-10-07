/* @layer renderer-hooks @kind hook */
/**
 * What this seed's ponds ask for, memoized per snapshot and seed. The roll is
 * the generator's own (fill/pond-demands-of-snapshot.ts), so the preview and
 * the placement carry the same demands, and the deliverable sets come from the
 * capability probes, the same sets generation is given.
 *
 * A snapshot the pool cannot be built from asks for nothing: the panel then
 * shows the plan's rupee prices, which is what it showed before the demands
 * existed.
 */
import { useMemo } from 'react';
import { pondDemandsOfSnapshot } from '@shared/randomizer/ap-world/fill/pond-demands-of-snapshot';
import { NO_POND_DEMANDS } from '@shared/randomizer/ap-world/pond/pond-demand-seed';
import { deliverableSets } from './deliverable-sets';
import type { PondDemandView } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/ap-world/options.type';

const usePondDemands = (snapshot: RandomizerOptionsSnapshot, seed: string): PondDemandView => useMemo(() => {
  if (seed === '') return NO_POND_DEMANDS;
  try {
    return pondDemandsOfSnapshot(snapshot, seed, deliverableSets());
  } catch {
    return NO_POND_DEMANDS;
  }
}, [snapshot, seed]);

export { usePondDemands };
