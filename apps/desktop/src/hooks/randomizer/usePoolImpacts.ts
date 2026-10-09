/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { accountingOf } from '@rotp/randomizer';
import { poolImpactOf } from '@rotp/randomizer';
import { deliverableSets } from './deliverable-sets';
import { poolImpactCell } from './impact-cell';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { PoolImpact } from '@rotp/randomizer';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { PoolImpacts } from './use-pool-impacts.type';
import { UNAVAILABLE } from './use-pool-impacts.constants';

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const usePoolImpacts = (snapshot: RandomizerOptionsSnapshot, seed = ''): PoolImpacts => useMemo(() => {
  const deliverable = deliverableSets();
  const cache = new Map<string, ImpactCell>();
  const cellOf = (key: string): ImpactCell => {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    let impact: PoolImpact;
    try {
      impact = poolImpactOf(key, snapshot, deliverable, seed);
    } catch {
      impact = UNAVAILABLE;
    }
    const cell = poolImpactCell(impact);
    cache.set(key, cell);
    return cell;
  };
  try {
    return { accounting: accountingOf(snapshot, deliverable, seed), cellOf };
  } catch (error) {
    return { accounting: null, error: messageOf(error), cellOf };
  }
}, [snapshot, seed]);

export { usePoolImpacts };
export type { PoolImpacts };
