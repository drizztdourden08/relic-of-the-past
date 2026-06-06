import { S } from '../styles';
import { DescRow } from './DescRow';
import type { useNavigation } from '../useNavigation';

type Props = Pick<ReturnType<typeof useNavigation>, 'isIndoors' | 'palaceIndex' | 'roomIndex' | 'dungeonMapPos' | 'roomLayoutInfo' | 'whichEntrance' | 'roomStartLayer' | 'overworldScreenIndex' | 'isDarkWorld' | 'progressInfo' | 'displayedVariant' | 'dynamicBlockerCount'>;

/** "Game State" info panel for the Navigation widget. */
const GameStatePanel = (props: Props) => {
  const { isIndoors, palaceIndex, roomIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, overworldScreenIndex, isDarkWorld, progressInfo, displayedVariant, dynamicBlockerCount } = props;
  return (
    <>
      {/* ═══ 1a. GAME STATE ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Game State</div>
        <div style={S.infoBox}>
          <DescRow label="Mode" desc="Whether Link is currently indoors (dungeon/cave/house) or outdoors on the overworld.">
            <span style={{ color: isIndoors ? '#fc6' : '#8c8' }}>{isIndoors ? 'Indoor' : 'Outdoor'}</span>
          </DescRow>
          {isIndoors ? (
            <>
              <DescRow label="Type" desc="The type of interior: Dungeon (palace index 0–13, has maps/keys/bosses), or Cave/House (palace 0xFF, standalone interiors with no dungeon logic).">
                <span style={{ color: palaceIndex === 0xFF ? '#8c8' : '#f8a' }}>{palaceIndex === 0xFF ? 'Cave / House' : 'Dungeon'}</span>
              </DescRow>
              <DescRow label="Room" desc="The current room ID in the indoor tilemap (0x0000–0x0127). Each indoor room is a 512×512 pixel area.">
                <span>0x{roomIndex.toString(16).toUpperCase().padStart(4, '0')}</span>
              </DescRow>
              <DescRow label="Grid Pos" desc="The room's position in the dungeon's 5×5 map grid for the current floor (from the dungeon map layout data). 1-based row,col. Falls back to absolute room grid (16×16) for caves/houses.">
                {dungeonMapPos?.found ? (
                  <span style={{ color: '#aac' }}>({dungeonMapPos.mapRow + 1}, {dungeonMapPos.mapCol + 1})</span>
                ) : (
                  <span style={{ color: '#666' }}>({(roomIndex >> 4) + 1}, {(roomIndex & 0xF) + 1})</span>
                )}
              </DescRow>
              {dungeonMapPos && (
                <DescRow label="Floor" desc="The current dungeon floor. Derived from dung_cur_floor: 0=1F, 1=2F, 0xFF=B1, 0xFE=B2, etc. The range shows all floors in this dungeon from highest to lowest.">
                  <span style={{ color: '#fc6' }}>{dungeonMapPos.floorLabel}</span>
                  <span style={{ color: '#888', marginLeft: 4, fontSize: 10 }}>[{dungeonMapPos.numAboveFloors > 0 ? `${dungeonMapPos.numAboveFloors}F` : ''}{dungeonMapPos.numAboveFloors > 0 && dungeonMapPos.numBasementFloors > 0 ? ' … ' : ''}{dungeonMapPos.numBasementFloors > 0 ? `B${dungeonMapPos.numBasementFloors}` : ''}]</span>
                </DescRow>
              )}
              {roomLayoutInfo && (() => {
                // Compute effective viewport size: base shape expanded by fullsize flags
                const baseW = (roomLayoutInfo.shape === '2x2' || roomLayoutInfo.shape === '2x1') ? 2 : 1;
                const baseH = (roomLayoutInfo.shape === '2x2' || roomLayoutInfo.shape === '1x2') ? 2 : 1;
                const effW = Math.max(baseW, roomLayoutInfo.quadrantFullsizeX > 0 ? 2 : baseW);
                const effH = Math.max(baseH, roomLayoutInfo.quadrantFullsizeY > 0 ? 2 : baseH);
                const effectiveShape = `${effW}×${effH}`;
                const hasScrollBoundaries = roomLayoutInfo.intraEdges.length > 0;
                return (
                  <DescRow label="Viewport" desc="Camera viewport of this room (width × height in screens). Based on the room's quadrant allocation + fullsize flags. 'open' = no internal camera scroll boundaries. 'scroll' = camera scrolls between quadrants.">
                    <span style={{ color: '#caf' }}>{effectiveShape}</span>
                    <span style={{ color: hasScrollBoundaries ? '#f84' : '#8c8', marginLeft: 4, fontSize: 10 }}>{hasScrollBoundaries ? 'scroll' : 'open'}</span>
                    <span style={{ color: '#666', marginLeft: 4, fontSize: 10 }}>raw={roomLayoutInfo.shape} idx={roomLayoutInfo.layout}</span>
                  </DescRow>
                );
              })()}
              {dungeonMapPos?.found && (
                <DescRow label="Effective Layout" desc="The room's actual footprint on the dungeon map grid, determined by counting how many cells this room occupies in the 5×5 map layout. This is what the in-game MAP screen shows.">
                  <span style={{ color: '#4fc' }}>{dungeonMapPos.effectiveLayout}</span>
                </DescRow>
              )}
              <DescRow label="Last Entrance" desc="The entrance ID Link last used to enter from the overworld. Determines spawn position, starting layer, and palace assignment. Does NOT update for indoor-to-indoor transitions.">
                <span style={{ color: whichEntrance ? '#7cf' : '#666' }}>{whichEntrance ? `0x${whichEntrance.toString(16).toUpperCase().padStart(2, '0')} (${whichEntrance})` : '—'}</span>
              </DescRow>
              <DescRow label="Palace Index" desc="Identifies which dungeon Link is in (0–13). 0xFF = cave/house (non-dungeon interior). Used for dungeon-specific logic like boss keys and maps.">
                <span>{palaceIndex === 0xFF ? 'Cave/House' : `${palaceIndex >> 1} (0x${palaceIndex.toString(16).toUpperCase()})`}</span>
              </DescRow>
              <DescRow label="Starting Layer" desc="The layer Link was on when this room was first entered. Captured at room load. In rooms with staircase type 2 (Blocked), Link stays locked to this layer. Layer toggles are caused by door type 22 (kDoorType_PlayerBgChange).">
                {roomStartLayer !== null ? (
                  <span style={{ color: roomStartLayer === 0 ? '#7ff' : '#ff7' }}>
                    {roomStartLayer === 0 ? 'Upper (BG2)' : 'Lower (BG1)'}
                  </span>
                ) : (
                  <span style={{ color: '#666' }}>—</span>
                )}
              </DescRow>
            </>
          ) : (
            <>
              <DescRow label="Screen" desc="The overworld screen index (0x00–0x3F). Grid position: row = upper bits, col = lower bits. Each screen is 512×512 pixels.">
                <span>0x{overworldScreenIndex.toString(16).toUpperCase().padStart(2, '0')} (R{(overworldScreenIndex >> 3) & 7} C{overworldScreenIndex & 7})</span>
              </DescRow>
              <DescRow label="World" desc="Light World or Dark World. The two 8×8 overworld grids occupy the same coordinate space but are separate maps.">
                <span style={{ color: isDarkWorld ? '#c8a' : '#8c8' }}>{isDarkWorld ? 'Dark World' : 'Light World'}</span>
              </DescRow>
            </>
          )}
          {progressInfo && (
            <DescRow label="Phase" desc="The game's progress indicator byte. Controls NPC dialogue, event triggers, and overworld tile patches. Advances as you complete key objectives.">
              <span style={{ color: '#fc6' }}>{progressInfo.label}</span>
              <span style={{ color: '#888', marginLeft: 4, fontSize: 10 }}>0x{progressInfo.tier.toString(16).padStart(2, '0')}</span>
            </DescRow>
          )}
          {displayedVariant && (
            <>
              <DescRow label="Tile Patch" desc="Whether this screen has an active event overlay that modifies walkable tiles (e.g. rocks removed after an event).">
                {displayedVariant.eventOverlayActive
                  ? <span style={{ color: '#4f8' }}>active</span>
                  : <span style={{ color: '#666' }}>none</span>}
              </DescRow>
              <DescRow label="Flags" desc="Screen-specific event flags from SRAM. Track permanent world changes like opened chests, pulled levers, and destroyed barriers.">
                <span style={{ color: '#aac' }}>0x{displayedVariant.screenEventFlags.toString(16).padStart(2, '0')}</span>
              </DescRow>
              <DescRow label="NPC Blockers" desc="Number of sprites currently blocking BFS pathfinding (tutorial guards, barriers). These physically prevent Link from passing.">
                <span style={{ color: dynamicBlockerCount > 0 ? '#fc6' : '#666' }}>{dynamicBlockerCount}</span>
              </DescRow>
            </>
          )}
        </div>
      </div>

    </>
  );
};

export { GameStatePanel };
