/* @layer renderer-lib @kind hook */
/**
 * The fill bar's totals of the live accounting, the same PoolAccounting the
 * In Pool column reads, so the bar, the cells and the listing move together
 * on every edit. Null while the pool cannot be built.
 */
import { useMemo } from 'react';
import { poolTotalsOf } from './pool-totals-model';
import type { PoolAccounting } from '@shared/randomizer/ap-world/pool/pool-accounting';
import type { PoolFillTotals } from '@domains/app/compounds/PoolFillBar';

const usePoolTotals = (accounting: PoolAccounting | null): PoolFillTotals | null =>
  useMemo(() => (accounting === null ? null : poolTotalsOf(accounting)), [accounting]);

export { usePoolTotals };
