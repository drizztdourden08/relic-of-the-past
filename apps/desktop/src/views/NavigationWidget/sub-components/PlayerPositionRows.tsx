/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { PlayerPositionRowsProps } from './PlayerStatePanel.type';

const PlayerPositionRows = ({ playerDebug, isIndoors, playerX, playerY }: PlayerPositionRowsProps) => (
  <>
    <DescRow label="Player Pos" desc="The player's world position in pixels, relative to the room origin indoors and the overworld origin outdoors.">
      <Text className="nav-val-dim">{playerX}, {playerY}</Text>
    </DescRow>
    {!isIndoors && (
      <DescRow label="World Pos" desc="The player's full world coordinates in pixels (same as Player Pos for outdoor). Used to calculate which overworld screen the player is standing on.">
        <Text className="nav-val-pos">({playerDebug.playerX}, {playerDebug.playerY})</Text>
      </DescRow>
    )}
    <DescRow label="Relative" desc="The player's position relative to the current 512×512 screen/room origin in pixels.">
      <Text className="nav-val-pos">({playerDebug.relX}, {playerDebug.relY})</Text>
    </DescRow>
    <DescRow label="Sub-tile" desc="The 8×8 tile range the player's hitbox currently overlaps. Row and column are in tile coordinates (0-63 per screen).">
      <Text className="nav-val-pos">r{playerDebug.tileMinRow}-{playerDebug.tileMaxRow} c{playerDebug.tileMinCol}-{playerDebug.tileMaxCol}</Text>
    </DescRow>
    <DescRow label="Map16" desc="The 16×16 metatile coordinate the player occupies. Map16 tiles are the collision unit. Each contains four 8×8 sub-tiles.">
      <Text className="nav-val-pos">({playerDebug.map16Row}, {playerDebug.map16Col})</Text>
    </DescRow>
    {!isIndoors && (
      <DescRow label="Live Screen" desc="The overworld screen the player is physically standing on right now (may differ from the 'Screen' in Game State during scrolling transitions).">
        <Text className="nav-val-pos">0x{playerDebug.liveScreenIndex.toString(16).toUpperCase()}</Text>
      </DescRow>
    )}
  </>
);

export { PlayerPositionRows };
