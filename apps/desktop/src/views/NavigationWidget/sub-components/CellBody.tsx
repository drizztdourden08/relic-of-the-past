/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { cellLabel } from '../behavior/cell-label';
import { ReachabilityCanvas } from './ReachabilityCanvas';
import type { CellBodyProps } from './OverworldMinimap.type';

const CellBody = ({ bundle, screen, size, result }: CellBodyProps) => (
  <>
    {result && <ReachabilityCanvas reachable={result.reachable} size={size} tileLayer={result.tileLayer} />}
    <Box className="nav-overworld-minimap__cell-name">{cellLabel(bundle, screen)}</Box>
    <Box className="nav-overworld-minimap__cell-hex">0x{screen.toString(16).toUpperCase()}</Box>
    {result && <Box className="nav-overworld-minimap__cell-count">{result.reachableCount}/{result.totalTiles}</Box>}
  </>
);

export { CellBody };
