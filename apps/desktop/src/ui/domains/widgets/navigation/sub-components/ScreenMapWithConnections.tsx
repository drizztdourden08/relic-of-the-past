/* @layer renderer-widgets @kind component */
import type { ConnectionInfo, ScreenBundle, FloodFillResult } from '@shared/game/navigation';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { IndoorMinimap } from './IndoorMinimap';
import { OverworldMinimap } from './OverworldMinimap';

/** Picks the indoor vs overworld minimap based on the current room context. */
const ScreenMapWithConnections = ({ bundle, connections, renderResults, linkScreenIndex, linkPos, respawnEntIds }: {
  bundle: ScreenBundle;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  linkScreenIndex: number | null;
  linkPos: { screen: number; row: number; col: number } | null;
  respawnEntIds: Set<number>;
}) => {
  const { roomIndex, isIndoors } = useGameUIStore(s => s.map);
  const props = { bundle, connections, renderResults, linkScreenIndex, linkPos, respawnEntIds, roomIndex };
  return isIndoors ? <IndoorMinimap {...props} /> : <OverworldMinimap {...props} />;
};

export { ScreenMapWithConnections };
