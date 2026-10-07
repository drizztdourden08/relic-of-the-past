/* @layer renderer-components @kind component */
/**
 * The pool against every location of the world as one segmented bar: the
 * checks tracker's summary bar, read for a fill. The track is every location
 * this seed generates, the same total the Checks widget shows; it fills left
 * to right with the items in the pool (green), the capacity upgrades
 * (purple), the filler (yellow), the spots settled before the shuffle (red),
 * the boss prizes (blue) and the reward-less events (grey). The legend under
 * it is one entry per colour, swatch, count and meaning. Bare: the totals
 * arrive reconciled.
 */
import { Box, Text } from '@ds/primitives';
import type { PoolFillBarProps, PoolFillTotals } from './PoolFillBar.type';
import './PoolFillBar.css';

type Segment = keyof PoolFillTotals;

/** Placement order, left to right. */
const SEGMENTS: readonly Segment[] = ['items', 'upgrades', 'filler', 'fixed', 'prizes', 'events'];

const LEGEND: readonly { key: Segment; label: string; title: string }[] = [
  { key: 'items', label: 'items in pool', title: 'Items the shuffle places that are neither a capacity upgrade nor filler' },
  { key: 'upgrades', label: 'upgrades', title: 'Capacity upgrade items, each in a filler\'s place' },
  { key: 'filler', label: 'filler', title: 'Balance filler still in the pool' },
  { key: 'fixed', label: 'fixed', title: 'Spots settled before the shuffle' },
  { key: 'prizes', label: 'prizes', title: 'The ten boss-reward slots, pre-placed from their own fixed pool' },
  { key: 'events', label: 'events', title: 'Pure logic locations: a check, but never a reward' },
];

const totalOf = (totals: PoolFillTotals): number => SEGMENTS.reduce((sum, key) => sum + totals[key], 0);

const widthOf = (total: number, count: number): string => (total > 0 ? `${(count / total) * 100}%` : '0%');

const Legend = ({ totals, total }: { totals: PoolFillTotals; total: number }) => (
  <Box className="pool-fill__legend">
    {LEGEND.map((entry) => (
      <Text key={entry.key} className="pool-fill__stat" title={entry.title}>
        <Box as="span" className={`pool-fill__swatch pool-fill__swatch--${entry.key}`} />
        <Box as="span" className={`pool-fill__count pool-fill__count--${entry.key}`}>{totals[entry.key]}</Box>
        <Box as="span" className="pool-fill__stat-label">{` ${entry.label}`}</Box>
      </Text>
    ))}
    <Text className="pool-fill__stat" title="Every location this seed generates, the same total the Checks widget shows">
      <Box as="span" className="pool-fill__count pool-fill__count--total">{total}</Box>
      <Box as="span" className="pool-fill__stat-label">{' total'}</Box>
    </Text>
  </Box>
);

const PoolFillBar = (props: PoolFillBarProps) => {
  const { totals, error, className = '' } = props;
  const classes = `pool-fill${totals === null ? ' pool-fill--error' : ''}${className ? ` ${className}` : ''}`;
  if (totals === null) {
    return (
      <Box className={classes}>
        <Text className="pool-fill__error">{error ?? 'pool not available'}</Text>
      </Box>
    );
  }
  const total = totalOf(totals);
  return (
    <Box className={classes}>
      <Box className="pool-fill__bar">
        {SEGMENTS.map((segment) => (
          <Box
            key={segment}
            className={`pool-fill__seg pool-fill__seg--${segment}`}
            style={{ width: widthOf(total, totals[segment]) }}
          />
        ))}
      </Box>
      <Legend totals={totals} total={total} />
    </Box>
  );
};

export { PoolFillBar };
