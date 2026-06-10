/* @layer renderer-widgets @kind data */
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { DescRow } from './DescRow';
import type { useNavigation } from '../useNavigation';

type Props = Pick<ReturnType<typeof useNavigation>, 'linkDebug' | 'isIndoors' | 'linkX' | 'linkY'>;

/** "Link State" info panel for the Navigation widget. */
const LinkStatePanel = (props: Props) => {
  const { linkDebug, isIndoors, linkX, linkY } = props;
  if (!linkDebug) return null;

  return (
    <Box style={S.section}>
      <Box style={S.sectionTitle}>Link State</Box>
      <Box style={S.infoBox}>
        <DescRow label="Link Pos" desc="Link's absolute world position in pixels. Indoor: relative to room origin. Outdoor: relative to overworld origin (0,0 = top-left of screen 0x00).">
          <Text style={S.valDim}>{linkX}, {linkY}</Text>
        </DescRow>
        {!isIndoors && (
          <DescRow label="World Pos" desc="Link's full world coordinates in pixels (same as Link Pos for outdoor). Used to calculate which overworld screen Link is actually standing on.">
            <Text style={S.valPos}>({linkDebug.linkX}, {linkDebug.linkY})</Text>
          </DescRow>
        )}
        <DescRow label="Relative" desc="Link's position relative to the current 512×512 screen/room origin in pixels.">
          <Text style={S.valPos}>({linkDebug.relX}, {linkDebug.relY})</Text>
        </DescRow>
        <DescRow label="Sub-tile" desc="The 8×8 tile range Link's hitbox currently overlaps. Row and column are in tile coordinates (0–63 per screen).">
          <Text style={S.valPos}>r{linkDebug.tileMinRow}–{linkDebug.tileMaxRow} c{linkDebug.tileMinCol}–{linkDebug.tileMaxCol}</Text>
        </DescRow>
        <DescRow label="Map16" desc="The 16×16 metatile coordinate Link occupies. Map16 tiles are the collision unit — each contains four 8×8 sub-tiles.">
          <Text style={S.valPos}>({linkDebug.map16Row}, {linkDebug.map16Col})</Text>
        </DescRow>
        {!isIndoors && (
          <DescRow label="Live Screen" desc="The overworld screen Link is physically standing on right now (may differ from the 'Screen' in Game State during scrolling transitions).">
            <Text style={S.valPos}>0x{linkDebug.liveScreenIndex.toString(16).toUpperCase()}</Text>
          </DescRow>
        )}
        {linkDebug.linkLayer !== null && (
          <DescRow label="Layer" desc="Link's current collision layer (link_is_on_lower_level). 0=Upper/BG2 (drawn behind BG1), 1=Lower/BG1 (drawn in front). Can change via staircases if not blocked.">
            <Text style={S.valInfo}>
              {linkDebug.linkLayer === 0 ? '0 (upper/BG2)' : '1 (lower/BG1)'}
            </Text>
          </DescRow>
        )}
        {linkDebug.collisionType !== null && linkDebug.collisionType >= 0 && (
          <DescRow label="Collision" desc="Room collision type (room_is_dark byte bits). 0=single layer, 1=both layers active, 2=both+scroll, 3=moving floor, 4=water/swim. Determines which BG layers have collision.">
            <Text style={S.valInfo}>
              {linkDebug.collisionType} ({['One', 'Both', 'Both+Scroll', 'MovFloor', 'Swim'][linkDebug.collisionType] ?? '?'})
            </Text>
          </DescRow>
        )}
        {linkDebug.staircaseType !== null && linkDebug.staircaseType >= 0 && (
          <DescRow label="Staircase" desc="Controls layer-change behavior (kind_of_in_room_staircase). 0=intra-room stairs (layer+room shift), 1=layer stairs (changes allowed), 2=pseudo/water stairs (ALL layer changes BLOCKED).">
            <Text style={{ color: linkDebug.staircaseType === 2 ? 'var(--c-danger)' : 'var(--c-green-bright)' }}>
              {linkDebug.staircaseType} ({['IntraRoom', 'Layer', 'Blocked'][linkDebug.staircaseType] ?? '?'})
            </Text>
          </DescRow>
        )}
      </Box>
    </Box>
  );
};

export { LinkStatePanel };
