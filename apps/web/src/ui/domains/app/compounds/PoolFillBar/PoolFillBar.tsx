/* @layer renderer-components @kind component */
import { Box, SegmentedBar, Text } from '@ds/primitives';
import { Legend } from '@ds/composites';
import type { LegendEntry, LegendTotal } from '@ds/composites';
import { SEGMENTS, TOTAL_TITLE } from './PoolFillBar.constants';
import type { PoolFillBarProps, PoolFillTotals } from './PoolFillBar.type';
import './PoolFillBar.css';

const entriesOf = (totals: PoolFillTotals): LegendEntry[] =>
  SEGMENTS.map((segment) => ({ ...segment, value: totals[segment.key] }));

const totalOf = (entries: readonly LegendEntry[]): LegendTotal => ({
  label: 'total',
  value: entries.reduce((sum, entry) => sum + entry.value, 0),
  title: TOTAL_TITLE,
});

const PoolFillBar = (props: PoolFillBarProps) => {
  const { totals, error, legend = 'inline', className = '' } = props;
  const classes = `pool-fill${className ? ` ${className}` : ''}`;
  if (totals === null) {
    return (
      <Box className={classes}>
        <Text className="pool-fill__error">{error ?? 'pool not available'}</Text>
      </Box>
    );
  }
  const entries = entriesOf(totals);
  return (
    <Box className={classes}>
      <SegmentedBar segments={entries} />
      <Legend entries={entries} total={totalOf(entries)} variant={legend} />
    </Box>
  );
};

export { PoolFillBar };
