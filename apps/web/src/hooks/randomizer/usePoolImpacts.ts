/* @layer renderer-lib @kind hook */
/**
 * The In Pool column, live: the real pool accounting of a snapshot and the
 * per-option cell, worded, memoized per snapshot (a full pass is a few
 * milliseconds, so every edit recomputes). The deliverable sets come from
 * the capability probes — the same sets generation uses, so the column
 * shows exactly what the seed will carry. A pool that cannot be built (more
 * upgrades than the filler can absorb) reports its reason instead.
 */
import { useMemo } from 'react';
import { accountingOf } from '@shared/randomizer/ap-world/pool/pool-accounting';
import { poolImpactOf } from '@shared/randomizer/ap-world/pool/pool-impact';
import { deliverableSets } from './deliverable-sets';
import { poolImpactCell } from './impact-cell';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/ap-world/options.type';
import type { PoolAccounting } from '@shared/randomizer/ap-world/pool/pool-accounting';
import type { PoolImpact } from '@shared/randomizer/ap-world/pool/pool-impact';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';

interface PoolImpacts {
  accounting: PoolAccounting | null;
  /** Why there is no accounting, when there is none. */
  error?: string;
  /** The worded In Pool cell of one option. */
  cellOf: (key: string) => ImpactCell;
}

const UNAVAILABLE: PoolImpact = { locations: 0, items: 0, note: 'n/a' };

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const usePoolImpacts = (snapshot: RandomizerOptionsSnapshot): PoolImpacts => useMemo(() => {
  const deliverable = deliverableSets();
  const cache = new Map<string, ImpactCell>();
  const cellOf = (key: string): ImpactCell => {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    let impact: PoolImpact;
    try {
      impact = poolImpactOf(key, snapshot, deliverable);
    } catch {
      impact = UNAVAILABLE;
    }
    const cell = poolImpactCell(impact);
    cache.set(key, cell);
    return cell;
  };
  try {
    return { accounting: accountingOf(snapshot, deliverable), cellOf };
  } catch (error) {
    return { accounting: null, error: messageOf(error), cellOf };
  }
}, [snapshot]);

export { usePoolImpacts };
export type { PoolImpacts };
