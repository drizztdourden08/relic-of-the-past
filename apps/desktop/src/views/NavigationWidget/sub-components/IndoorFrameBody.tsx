/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ReachabilityCanvas } from './ReachabilityCanvas';
import { MAP_SIZE } from './IndoorMinimap.constants';
import type { IndoorFrameBodyProps } from './IndoorMinimap.type';

const IndoorFrameBody = ({ result }: IndoorFrameBodyProps) => {
  if (!result) return null;

  return (
    <>
      <ReachabilityCanvas reachable={result.reachable} size={MAP_SIZE} tileLayer={result.tileLayer} bounds={{ minRow: 0, maxRow: 63, minCol: 0, maxCol: 63 }} />
      <Box className="nav-indoor-minimap__count-label">
        {result.reachableCount}/{result.totalTiles}
      </Box>
    </>
  );
};

export { IndoorFrameBody };
