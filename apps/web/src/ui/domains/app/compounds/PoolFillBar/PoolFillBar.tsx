/* @layer renderer-components @kind component */
/**
 * The pool against the spots of the world as one segmented bar: the checks
 * tracker's summary bar, read for a fill. The track is every spot; it fills
 * left to right with the items in the pool (green), the capacity upgrades
 * (purple), the filler (yellow) and the spots settled before the shuffle
 * (red); whatever stays bare has nothing. The legend under it is one entry
 * per colour, swatch, count and meaning. Bare: the totals arrive reconciled.
 */
import { Box, Text } from '@ds/primitives';
import type { PoolFillBarProps, PoolFillTotals } from './PoolFillBar.type';
import './PoolFillBar.css';

type Segment = 'items' | 'upgrades' | 'filler' | 'fixed';

/** Placement order, left to right. */
const SEGMENTS: readonly Segment[] = ['items', 'upgrades', 'filler', 'fixed'];

const LEGEND: readonly { key: keyof PoolFillTotals; label: string; title: string }[] = [
  { key: 'items', label: 'items in pool', title: 'Items the shuffle places that are neither a capacity upgrade nor filler' },
  { key: 'upgrades', label: 'upgrades', title: 'Capacity upgrade items, each in a filler\'s place' },
  { key: 'filler', label: 'filler', title: 'Balance filler still in the pool' },
  { key: 'fixed', label: 'fixed', title: 'Spots settled before the shuffle' },
  { key: 'spots', label: 'spots', title: 'Every spot an item can sit in, the full bar' },
];

const widthOf = (totals: PoolFillTotals, count: number): string =>
  totals.spots > 0 ? `${(count / totals.spots) * 100}%` : '0%';

const Legend = ({ totals }: { totals: PoolFillTotals }) => (
  <Box className="pool-fill__legend">
    {LEGEND.map((entry) => (
      <Text key={entry.key} className="pool-fill__stat" title={entry.title}>
        <Box as="span" className={`pool-fill__swatch pool-fill__swatch--${entry.key}`} />
        <Box as="span" className={`pool-fill__count pool-fill__count--${entry.key}`}>{totals[entry.key]}</Box>
        <Box as="span" className="pool-fill__stat-label">{` ${entry.label}`}</Box>
      </Text>
    ))}
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
  return (
    <Box className={classes}>
      <Box className="pool-fill__bar">
        {SEGMENTS.map((segment) => (
          <Box
            key={segment}
            className={`pool-fill__seg pool-fill__seg--${segment}`}
            style={{ width: widthOf(totals, totals[segment]) }}
          />
        ))}
      </Box>
      <Legend totals={totals} />
    </Box>
  );
};

export { PoolFillBar };
