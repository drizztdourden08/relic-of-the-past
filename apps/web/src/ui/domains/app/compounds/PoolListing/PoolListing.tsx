/* @layer renderer-components @kind component */
/**
 * The item pool of the current options, as the generator would shuffle it —
 * a multiset, not a placement. One compact column: the fill bar in the
 * header (the pool against the spots of the world), then each group of the
 * pool builder's own partition with its items as sprite · name · ×count
 * rows. Bare: groups arrive counted and sorted, totals reconciled.
 */
import { Box, Image, ScrollArea, Text } from '@ds/primitives';
import { PoolFillBar } from '../PoolFillBar';
import type { PoolListingProps, PoolListingRow } from './PoolListing.type';
import './PoolListing.css';

// The same placeholder stands in for a row without art and for a sprite file
// that fails to load, so the list never shows the browser's broken-image glyph.
const PLACEHOLDER = <Box className="pool-listing__sprite pool-listing__sprite--placeholder" />;

const Row = ({ row }: { row: PoolListingRow }) => (
  <Box className="pool-listing__row">
    {row.sprite !== undefined
      ? <Image className="pool-listing__sprite" src={row.sprite} alt="" draggable={false} fallback={PLACEHOLDER} />
      : PLACEHOLDER}
    <Text className="pool-listing__name">{row.name}</Text>
    <Text className="pool-listing__count">{`×${row.count}`}</Text>
  </Box>
);

const PoolListing = (props: PoolListingProps) => {
  const { groups, totals, error, className = '' } = props;

  return (
    <Box className={`pool-listing${className ? ` ${className}` : ''}`}>
      <Box className="pool-listing__header">
        <Text className="pool-listing__title">Item pool</Text>
        <PoolFillBar totals={totals} error={error} />
      </Box>
      <ScrollArea className="pool-listing__body">
        {groups.map((group) => (
          <Box key={group.id} className="pool-listing__group">
            <Box className="pool-listing__group-head">
              <Text className="pool-listing__group-title">{group.label}</Text>
              <Text className="pool-listing__group-total">{`×${group.total}`}</Text>
            </Box>
            {group.rows.map((row) => <Row key={row.name} row={row} />)}
          </Box>
        ))}
      </ScrollArea>
    </Box>
  );
};

export { PoolListing };
