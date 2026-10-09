/* @layer renderer-components @kind component */
import { Box, Image, Text } from '@drizztdourden08/tessera/primitives';
import type { PoolListingRow } from '../PoolListing.type';
import { SpritePlaceholder } from './SpritePlaceholder';

const PoolListingItem = ({ row }: { row: PoolListingRow }) => (
  <Box className="pool-listing__row">
    {row.sprite !== undefined
      ? <Image className="pool-listing__sprite" src={row.sprite} alt="" draggable={false} fallback={<SpritePlaceholder />} />
      : <SpritePlaceholder />}
    <Text className="pool-listing__name">{row.name}</Text>
    <Text className="pool-listing__count">{`×${row.count}`}</Text>
  </Box>
);

export { PoolListingItem };
