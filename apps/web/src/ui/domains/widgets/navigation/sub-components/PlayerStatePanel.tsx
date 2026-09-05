/* @layer renderer-widgets @kind data */
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { DescRow } from './DescRow';
import type { useNavigation } from '../useNavigation';

type Props = Pick<ReturnType<typeof useNavigation>, 'playerDebug' | 'isIndoors' | 'playerX' | 'playerY'>;

/** "Player State" info panel for the Navigation widget. */
const PlayerStatePanel = (props: Props) => {
  const { playerDebug, isIndoors, playerX, playerY } = props;
  if (!playerDebug) return null;

  return (
    <Box style={S.section}>
      <Box style={S.sectionTitle}>Player State</Box>
      <Box style={S.infoBox}>
        <DescRow label="Player Pos" desc="The player's absolute world position in pixels. Indoor: relative to room origin. Outdoor: relative to overworld origin (0,0 = top-left of screen 0x00).">
          <Text style={S.valDim}>{playerX}, {playerY}</Text>
        </DescRow>
        {!isIndoors && (
          <DescRow label="World Pos" desc="The player's full world coordinates in pixels (same as Player Pos for outdoor). Used to calculate which overworld screen the player is actually standing on.">
            <Text style={S.valPos}>({playerDebug.playerX}, {playerDebug.playerY})</Text>
          </DescRow>
        )}
        <DescRow label="Relative" desc="The player's position relative to the current 512×512 screen/room origin in pixels.">
          <Text style={S.valPos}>({playerDebug.relX}, {playerDebug.relY})</Text>
        </DescRow>
        <DescRow label="Sub-tile" desc="The 8×8 tile range the player's hitbox currently overlaps. Row and column are in tile coordinates (0-63 per screen).">
          <Text style={S.valPos}>r{playerDebug.tileMinRow}-{playerDebug.tileMaxRow} c{playerDebug.tileMinCol}-{playerDebug.tileMaxCol}</Text>
        </DescRow>
        <DescRow label="Map16" desc="The 16×16 metatile coordinate the player occupies. Map16 tiles are the collision unit. Each contains four 8×8 sub-tiles.">
          <Text style={S.valPos}>({playerDebug.map16Row}, {playerDebug.map16Col})</Text>
        </DescRow>
        {!isIndoors && (
          <DescRow label="Live Screen" desc="The overworld screen the player is physically standing on right now (may differ from the 'Screen' in Game State during scrolling transitions).">
            <Text style={S.valPos}>0x{playerDebug.liveScreenIndex.toString(16).toUpperCase()}</Text>
          </DescRow>
        )}
        {playerDebug.playerLayer !== null && (
          <DescRow label="Layer" desc="The player's current collision layer (link_is_on_lower_level). 0=Upper/BG2 (drawn behind BG1), 1=Lower/BG1 (drawn in front). Can change via staircases if not blocked.">
            <Text style={S.valInfo}>
              {playerDebug.playerLayer === 0 ? '0 (upper/BG2)' : '1 (lower/BG1)'}
            </Text>
          </DescRow>
        )}
        {playerDebug.collisionType !== null && playerDebug.collisionType >= 0 && (
          <DescRow label="Collision" desc="Room collision type (room_is_dark byte bits). 0=single layer, 1=both layers active, 2=both+scroll, 3=moving floor, 4=water/swim. Determines which BG layers have collision.">
            <Text style={S.valInfo}>
              {playerDebug.collisionType} ({['One', 'Both', 'Both+Scroll', 'MovFloor', 'Swim'][playerDebug.collisionType] ?? '?'})
            </Text>
          </DescRow>
        )}
        {isIndoors && (
          <DescRow label="Doorway" desc="Doorway state, both values LATCHED, not per-frame. Neither is safe to treat as 'is this happening right now'. The first is the orientation of the doorway the player occupies (is_standing_in_doorway): set on entering a room through a doorway, cleared only on certain intra-room transitions. 'Anim' is the door animation step (door_animation_step_indicator, 0-16): it stays at 16 once a door finishes opening instead of returning to 0.">
            <Text style={S.valInfo}>
              {playerDebug.inDoorway === 0 ? 'no' : `0x${playerDebug.inDoorway.toString(16).toUpperCase()}`}
              {playerDebug.doorAnimStep > 0 && <Text style={S.valWarning}> · anim {playerDebug.doorAnimStep}</Text>}
            </Text>
          </DescRow>
        )}
        {playerDebug.staircaseType !== null && playerDebug.staircaseType >= 0 && (
          <DescRow label="Staircase" desc="Controls layer-change behavior (kind_of_in_room_staircase). 0=intra-room stairs (layer+room shift), 1=layer stairs (changes allowed), 2=pseudo/water stairs (ALL layer changes BLOCKED).">
            <Text style={{ color: playerDebug.staircaseType === 2 ? 'var(--c-danger)' : 'var(--c-green-bright)' }}>
              {playerDebug.staircaseType} ({['IntraRoom', 'Layer', 'Blocked'][playerDebug.staircaseType] ?? '?'})
            </Text>
          </DescRow>
        )}
      </Box>
    </Box>
  );
};

export { PlayerStatePanel };
