/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { GameStatePanelProps } from './GameStatePanel.type';
import './GameStatePanel.css';

const GameStatePanel = (props: GameStatePanelProps) => {
  const { isIndoors, palaceIndex, roomIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, overworldScreenIndex, isDarkWorld, progressInfo, displayedVariant, dynamicBlockerCount } = props;
  return (
    <>
      <Box className="nav-section">
        <Box className="nav-section-title">Game State</Box>
        <Box className="nav-info-box">
          <DescRow label="Mode" desc="Whether the player is currently indoors (dungeon/cave/house) or outdoors on the overworld.">
            <Text className={isIndoors ? 'nav-val-warning' : 'nav-val-green'}>{isIndoors ? 'Indoor' : 'Outdoor'}</Text>
          </DescRow>
          {isIndoors ? (
            <>
              <DescRow label="Type" desc="The type of interior: Dungeon (palace index 0-13, has maps/keys/bosses), or Cave/House (palace 0xFF, standalone interiors with no dungeon logic).">
                <Text className={palaceIndex === 0xFF ? 'nav-val-green' : 'nav-val-info'}>{palaceIndex === 0xFF ? 'Cave / House' : 'Dungeon'}</Text>
              </DescRow>
              <DescRow label="Room" desc="The current room ID in the indoor tilemap (0x0000-0x0127). Each indoor room is a 512×512 pixel area.">
                <Text>0x{roomIndex.toString(16).toUpperCase().padStart(4, '0')}</Text>
              </DescRow>
              <DescRow label="Grid Pos" desc="The room's position in the dungeon's 5×5 map grid for the current floor (from the dungeon map layout data). 1-based row,col. Falls back to absolute room grid (16×16) for caves/houses.">
                {dungeonMapPos?.found ? (
                  <Text className="nav-val-dim">({dungeonMapPos.mapRow + 1}, {dungeonMapPos.mapCol + 1})</Text>
                ) : (
                  <Text className="nav-val-muted">({(roomIndex >> 4) + 1}, {(roomIndex & 0xF) + 1})</Text>
                )}
              </DescRow>
              {dungeonMapPos && (
                <DescRow label="Floor" desc="The current dungeon floor. Derived from dung_cur_floor: 0=1F, 1=2F, 0xFF=B1, 0xFE=B2, etc. The range shows all floors in this dungeon from highest to lowest.">
                  <Text className="nav-val-warning">{dungeonMapPos.floorLabel}</Text>
                  <Text className="nav-val-badge">[{dungeonMapPos.numAboveFloors > 0 ? `${dungeonMapPos.numAboveFloors}F` : ''}{dungeonMapPos.numAboveFloors > 0 && dungeonMapPos.numBasementFloors > 0 ? ' - ' : ''}{dungeonMapPos.numBasementFloors > 0 ? `B${dungeonMapPos.numBasementFloors}` : ''}]</Text>
                </DescRow>
              )}
              {roomLayoutInfo && (() => {
                const baseW = (roomLayoutInfo.shape === '2x2' || roomLayoutInfo.shape === '2x1') ? 2 : 1;
                const baseH = (roomLayoutInfo.shape === '2x2' || roomLayoutInfo.shape === '1x2') ? 2 : 1;
                const effW = Math.max(baseW, roomLayoutInfo.quadrantFullsizeX > 0 ? 2 : baseW);
                const effH = Math.max(baseH, roomLayoutInfo.quadrantFullsizeY > 0 ? 2 : baseH);
                const effectiveShape = `${effW}×${effH}`;
                const hasScrollBoundaries = roomLayoutInfo.intraEdges.length > 0;
                return (
                  <DescRow label="Viewport" desc="Camera viewport of this room (width × height in screens). Based on the room's quadrant allocation + fullsize flags. 'open' = no internal camera scroll boundaries. 'scroll' = camera scrolls between quadrants.">
                    <Text className="nav-val-info">{effectiveShape}</Text>
                    <Text className={hasScrollBoundaries ? 'nav-game-state-panel__scroll-tag nav-game-state-panel__scroll-tag--scroll' : 'nav-game-state-panel__scroll-tag nav-val-green'}>{hasScrollBoundaries ? 'scroll' : 'open'}</Text>
                    <Text className="nav-val-badge">raw={roomLayoutInfo.shape} idx={roomLayoutInfo.layout}</Text>
                  </DescRow>
                );
              })()}
              {dungeonMapPos?.found && (
                <DescRow label="Effective Layout" desc="The room's actual footprint on the dungeon map grid, determined by counting how many cells this room occupies in the 5×5 map layout. This is what the in-game MAP screen shows.">
                  <Text className="nav-val-info">{dungeonMapPos.effectiveLayout}</Text>
                </DescRow>
              )}
              <DescRow label="Last Entrance" desc="The entrance ID the player last used to enter from the overworld. Determines spawn position, starting layer, and palace assignment. Does NOT update for indoor-to-indoor transitions.">
                <Text className={whichEntrance ? 'nav-val-info' : 'nav-val-muted'}>{whichEntrance ? `0x${whichEntrance.toString(16).toUpperCase().padStart(2, '0')} (${whichEntrance})` : '-'}</Text>
              </DescRow>
              <DescRow label="Palace Index" desc="Identifies which dungeon the player is in (0-13). 0xFF = cave/house (non-dungeon interior). Used for dungeon-specific logic like boss keys and maps.">
                <Text>{palaceIndex === 0xFF ? 'Cave/House' : `${palaceIndex >> 1} (0x${palaceIndex.toString(16).toUpperCase()})`}</Text>
              </DescRow>
              <DescRow label="Starting Layer" desc="The layer the player was on when this room was first entered. Captured at room load. In rooms with staircase type 2 (Blocked), the player stays locked to this layer. Layer toggles are caused by door type 22 (kDoorType_PlayerBgChange).">
                {roomStartLayer !== null ? (
                  <Text className="nav-val-info">
                    {roomStartLayer === 0 ? 'Upper (BG2)' : 'Lower (BG1)'}
                  </Text>
                ) : (
                  <Text className="nav-val-muted">-</Text>
                )}
              </DescRow>
            </>
          ) : (
            <>
              <DescRow label="Screen" desc="The overworld screen index (0x00-0x3F). Grid position: row = upper bits, col = lower bits. Each screen is 512×512 pixels.">
                <Text>0x{overworldScreenIndex.toString(16).toUpperCase().padStart(2, '0')} (R{(overworldScreenIndex >> 3) & 7} C{overworldScreenIndex & 7})</Text>
              </DescRow>
              <DescRow label="World" desc="Light World or Dark World. The two 8×8 overworld grids occupy the same coordinate space but are separate maps.">
                <Text className={isDarkWorld ? 'nav-game-state-panel__dark-world' : 'nav-val-green'}>{isDarkWorld ? 'Dark World' : 'Light World'}</Text>
              </DescRow>
            </>
          )}
          {progressInfo && (
            <DescRow label="Phase" desc="The game's progress indicator byte. Controls NPC dialogue, event triggers, and overworld tile patches. Advances as you complete key objectives.">
              <Text className="nav-val-warning">{progressInfo.label}</Text>
              <Text className="nav-val-badge">0x{progressInfo.tier.toString(16).padStart(2, '0')}</Text>
            </DescRow>
          )}
          {displayedVariant && (
            <>
              <DescRow label="Tile Patch" desc="Whether this screen has an active event overlay that modifies walkable tiles (e.g. rocks removed after an event).">
                {displayedVariant.eventOverlayActive
                  ? <Text className="nav-val-green">active</Text>
                  : <Text className="nav-val-muted">none</Text>}
              </DescRow>
              <DescRow label="Flags" desc="Screen-specific event flags from SRAM. Track permanent world changes like opened chests, pulled levers, and destroyed barriers.">
                <Text className="nav-val-dim">0x{displayedVariant.screenEventFlags.toString(16).padStart(2, '0')}</Text>
              </DescRow>
              <DescRow label="NPC Blockers" desc="Number of sprites currently blocking BFS pathfinding (tutorial guards, barriers). These physically prevent the player from passing.">
                <Text className={dynamicBlockerCount > 0 ? 'nav-val-warning' : 'nav-val-muted'}>{dynamicBlockerCount}</Text>
              </DescRow>
            </>
          )}
        </Box>
      </Box>

    </>
  );
};

export { GameStatePanel };
