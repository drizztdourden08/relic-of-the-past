/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { accountingOf } from '@shared/randomizer/world/pool/pool-accounting';
import { poolImpactOf } from '@shared/randomizer/world/pool/pool-impact';
import { deliverableSets } from './deliverable-sets';
import { poolImpactCell } from './impact-cell';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { PoolImpact } from '@shared/randomizer/world/pool/pool-impact';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { PoolImpacts } from './usePoolImpacts.type';
import { UNAVAILABLE } from './usePoolImpacts.constants';

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
