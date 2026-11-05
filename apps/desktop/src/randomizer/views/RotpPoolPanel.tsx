/* @layer renderer-components @kind component */
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { PoolSummary } from '@app/views/Randomizer/sub-components/PoolSummary';
import { useRotpRunSummary } from './useRotpRunSummary';

const RotpPoolPanel = ({ config }: RunPanelProps) => {
  const { accounting, error, totals, summary } = useRotpRunSummary({ config });

  return <PoolSummary accounting={accounting} totals={totals} error={error} summary={summary} />;
};

export { RotpPoolPanel };
