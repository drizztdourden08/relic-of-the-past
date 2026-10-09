/* @layer renderer-widgets @kind component */
import type { ConnectionInfo, ScreenBundleGrid, FloodFillResult } from '@shared/game/navigation';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { IndoorMinimap } from './IndoorMinimap';
import { OverworldMinimap } from './OverworldMinimap';

const ScreenMapWithConnections = ({ bundle, connections, renderResults, playerScreenIndex, playerPos }: {
  bundle: ScreenBundleGrid;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  playerScreenIndex: number | null;
  playerPos: { screen: number; row: number; col: number } | null;
}) => {
  const { roomIndex, isIndoors } = useGameUIStore(s => s.map);
  const props = { bundle, connections, renderResults, playerScreenIndex, playerPos, roomIndex };
  return isIndoors ? <IndoorMinimap {...props} /> : <OverworldMinimap {...props} />;
};

export { ScreenMapWithConnections };
