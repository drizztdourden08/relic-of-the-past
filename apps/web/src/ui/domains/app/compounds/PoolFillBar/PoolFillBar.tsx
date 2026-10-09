/* @layer renderer-components @kind component */
import { Box, StackedBar, Text } from '@drizztdourden08/tessera/primitives';
import type { StackedBarSegment } from '@drizztdourden08/tessera/primitives';
import { BAR_LABEL, SEGMENTS, TOTAL_TITLE } from './PoolFillBar.constants';
import type { PoolFillBarProps, PoolFillTotals } from './PoolFillBar.type';
import './PoolFillBar.css';

const segmentsOf = (totals: PoolFillTotals): StackedBarSegment[] =>
  SEGMENTS.map(({ key, label, color }) => ({ id: key, label, color, value: totals[key] }));

const PoolFillBar = (props: PoolFillBarProps) => {
  const { totals, error, className = '' } = props;
  const classes = `pool-fill${className ? ` ${className}` : ''}`;
  if (totals === null) {
    return (
      <Box className={classes}>
        <Text className="pool-fill__error">{error ?? 'pool not available'}</Text>
      </Box>
    );
  }
  const segments = segmentsOf(totals);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <Box className={classes}>
      <StackedBar segments={segments} label={BAR_LABEL} legend />
      <Text className="pool-fill__total" title={TOTAL_TITLE}>{`total ${total}`}</Text>
    </Box>
  );
};

export { PoolFillBar };
