/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { effectiveShapeOf } from '../behavior/effective-shape-of';
import { DescRow } from './DescRow';
import type { IndoorLayoutRowsProps } from './GameStatePanel.type';

const IndoorLayoutRows = ({ roomLayoutInfo, dungeonMapPos }: IndoorLayoutRowsProps) => {
  const hasScrollBoundaries = roomLayoutInfo !== null && roomLayoutInfo.intraEdges.length > 0;

  return (
    <>
      {roomLayoutInfo && (
        <DescRow label="Viewport" desc="Camera viewport of this room (width × height in screens). 'open' = no internal scroll boundaries. 'scroll' = camera scrolls between quadrants.">
          <Text className="nav-val-info">{effectiveShapeOf(roomLayoutInfo)}</Text>
          <Text className={hasScrollBoundaries ? 'nav-game-state-panel__scroll-tag nav-game-state-panel__scroll-tag--scroll' : 'nav-game-state-panel__scroll-tag nav-val-green'}>{hasScrollBoundaries ? 'scroll' : 'open'}</Text>
          <Text className="nav-val-badge">raw={roomLayoutInfo.shape} idx={roomLayoutInfo.layout}</Text>
        </DescRow>
      )}
      {dungeonMapPos?.found && (
        <DescRow label="Effective Layout" desc="How many cells the room occupies on the dungeon map grid.">
          <Text className="nav-val-info">{dungeonMapPos.effectiveLayout}</Text>
        </DescRow>
      )}
    </>
  );
};

export { IndoorLayoutRows };
