/* @layer renderer-components @kind component */
import { Box, ScrollArea, Text } from '@drizztdourden08/tessera/primitives';
import { PoolFillBar } from '../PoolFillBar';
import { PoolListingItem } from './sub-components/PoolListingItem';
import type { PoolListingProps } from './PoolListing.type';
import './PoolListing.css';

const PoolListing = (props: PoolListingProps) => {
  const { groups, totals, error, titled = true, className = '' } = props;

  return (
    <Box className={`pool-listing${className ? ` ${className}` : ''}`}>
      <Box className="pool-listing__header">
        {titled && <Text className="pool-listing__title">Item pool</Text>}
        <PoolFillBar totals={totals} error={error} />
      </Box>
      <ScrollArea className="pool-listing__body">
        {groups.map((group) => (
          <Box key={group.id} className="pool-listing__group">
            <Box className="pool-listing__group-head">
              <Text className="pool-listing__group-title">{group.label}</Text>
              <Text className="pool-listing__group-total">{`×${group.total}`}</Text>
            </Box>
            {group.rows.map((row) => <PoolListingItem key={row.name} row={row} />)}
          </Box>
        ))}
      </ScrollArea>
    </Box>
  );
};

export { PoolListing };
