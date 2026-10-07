/* @layer renderer-components @kind component */
/**
 * The pool against every location of the world as one segmented bar: the
 * checks tracker's summary bar, read for a fill. The track is every location
 * this seed generates, the same total the Checks widget shows; it fills left
 * to right with the items in the pool (green), the capacity upgrades
 * (purple), the filler (yellow), the spots settled before the shuffle (red)
 * and the boss prizes (blue). The legend under it is one entry per colour,
 * then the total. Bare: the totals arrive reconciled.
 */
import { Box, SegmentedBar, Text } from '@ds/primitives';
import { Legend } from '@ds/composites';
import type { LegendEntry, LegendTotal } from '@ds/composites';
import type { PoolFillBarProps, PoolFillTotals } from './PoolFillBar.type';
import './PoolFillBar.css';

type Segment = keyof PoolFillTotals;

/** Placement order, left to right, with each segment's colour and meaning. */
const SEGMENTS: readonly (Omit<LegendEntry, 'key' | 'value'> & { key: Segment })[] = [
  { key: 'items', tone: 'green', label: 'items in pool', title: 'Items the shuffle places that are neither a capacity upgrade nor filler' },
  { key: 'upgrades', tone: 'upgrade', label: 'upgrades', title: 'Capacity upgrade items, each in a filler\'s place' },
  { key: 'filler', tone: 'warning', label: 'filler', title: 'Balance filler still in the pool' },
  { key: 'fixed', tone: 'danger', label: 'fixed', title: 'Spots settled before the shuffle' },
  { key: 'prizes', tone: 'info', label: 'prizes', title: 'The ten boss-reward slots, pre-placed from their own fixed pool' },
];

const TOTAL_TITLE = 'Every location this seed generates, the same total the Checks widget shows';

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
