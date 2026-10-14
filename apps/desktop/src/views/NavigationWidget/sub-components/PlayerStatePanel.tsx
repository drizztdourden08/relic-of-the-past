/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { CollisionRow } from './CollisionRow';
import { DoorwayRow } from './DoorwayRow';
import { LayerRow } from './LayerRow';
import { PlayerPositionRows } from './PlayerPositionRows';
import { StaircaseRow } from './StaircaseRow';
import type { PlayerStatePanelProps } from './PlayerStatePanel.type';

const PlayerStatePanel = (props: PlayerStatePanelProps) => {
  const { playerDebug, isIndoors, playerX, playerY } = props;
  if (!playerDebug) return null;

  return (
    <Box className="nav-section">
      <Box className="nav-section-title">Player State</Box>
      <Box className="nav-info-box">
        <PlayerPositionRows playerDebug={playerDebug} isIndoors={isIndoors} playerX={playerX} playerY={playerY} />
        <LayerRow playerDebug={playerDebug} />
        <CollisionRow playerDebug={playerDebug} />
        {isIndoors && <DoorwayRow playerDebug={playerDebug} />}
        <StaircaseRow playerDebug={playerDebug} />
      </Box>
    </Box>
  );
};

export { PlayerStatePanel };
