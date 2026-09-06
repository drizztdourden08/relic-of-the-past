/* @layer renderer-components @kind component */
/**
 * The total row under an options panel: the fill bar of the real pool
 * accounting: what the fill will place, against the spots of the world.
 * When the pool cannot be built (more upgrades than the filler can absorb)
 * the row carries the reason instead of the bar.
 */
import { Box } from '@ds/primitives';
import { PoolFillBar } from '../PoolFillBar';
import type { PoolFillTotals } from '../PoolFillBar';
import './PoolTotals.css';

interface PoolTotalsProps {
  /** Null when the pool could not be built; `error` then says why. */
  totals: PoolFillTotals | null;
  error?: string;
}

const PoolTotals = ({ totals, error }: PoolTotalsProps) => (
  <Box className="pool-totals">
    <PoolFillBar totals={totals} error={error} />
  </Box>
);

export { PoolTotals };
export type { PoolTotalsProps };
