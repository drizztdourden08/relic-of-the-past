/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { poolTotalsOf } from './pool-totals-model';
import type { PoolAccounting } from '@rotp/randomizer';
import type { PoolFillTotals } from '@app/compounds/PoolFillBar';

const usePoolTotals = (accounting: PoolAccounting | null): PoolFillTotals | null =>
  useMemo(() => (accounting === null ? null : poolTotalsOf(accounting)), [accounting]);

export { usePoolTotals };
