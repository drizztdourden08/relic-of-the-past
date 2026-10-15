/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { PoolFillBar } from '../PoolFillBar';
import type { PoolTotalsProps } from './PoolTotals.type';
import './PoolTotals.css';

const PoolTotals = ({ totals, error }: PoolTotalsProps) => (
  <Box className="pool-totals">
    <PoolFillBar totals={totals} error={error} />
  </Box>
);

export { PoolTotals };
