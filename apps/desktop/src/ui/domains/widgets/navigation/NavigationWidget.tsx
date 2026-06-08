/* @layer renderer-widgets @kind data */
import { Box, Text } from '../../../design-system/primitives';
import { S } from './styles';
import { ScreenMapWithConnections, DescRow, TileRecorderBtn, PathCopyBtn } from './sub-components';
import { GameStatePanel } from './sub-components/GameStatePanel';
import { ConnectionsPanel } from './sub-components/ConnectionsPanel';
import { useNavigation } from './useNavigation';

const NavigationWidgetContent = () => {
  const {
    screenBundle, screenName, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, renderResults, linkDebug, respawnEntIds, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, displayedVariant, dynamicBlockerCount, linkX, linkY, running, handleRun, result, toggleOverlay, overlayStore, autoRun, setAutoRun, reachableSum, totalTilesSum, entranceSum, internalConnections, fallHoleLandings, entranceSpawns,
  } = useNavigation();

  return (
    <Box style={S.root}>
      {/* ═══ 1. BUNDLE TITLE + SCREEN MAP ═══ */}
      <Box style={S.section}>
        <Box style={S.locName}>
          {screenBundle ? screenBundle.name : screenName}
          {screenBundle?.isMulti && <Text style={{ fontSize: 9, color: '#888', marginLeft: 6 }}>({screenBundle.screens.length} {isIndoors ? 'rooms' : 'screens'})</Text>}
        </Box>
        <Box style={S.meta}>
          {isIndoors ? `room-${roomIndex.toString(16).padStart(3, '0')}` : `${isDarkWorld ? 'dw' : 'lw'}-${overworldScreenIndex.toString(16).padStart(2, '0')}`} · {isIndoors ? 'INDOOR' : (isDarkWorld ? 'DW' : 'LW')}
          {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
        </Box>

        {/* Screen map with edge connection indicators */}
        {screenBundle && (
          <ScreenMapWithConnections bundle={screenBundle} connections={externalConnections} renderResults={renderResults} linkScreenIndex={linkDebug?.liveScreenIndex ?? null} linkPos={linkDebug ? { screen: linkDebug.liveScreenIndex, row: linkDebug.tileMinRow, col: linkDebug.tileMinCol } : null} respawnEntIds={respawnEntIds} />
        )}
      </Box>

      <GameStatePanel isIndoors={isIndoors} palaceIndex={palaceIndex} roomIndex={roomIndex} dungeonMapPos={dungeonMapPos} roomLayoutInfo={roomLayoutInfo} whichEntrance={whichEntrance} roomStartLayer={roomStartLayer} overworldScreenIndex={overworldScreenIndex} isDarkWorld={isDarkWorld} progressInfo={progressInfo} displayedVariant={displayedVariant} dynamicBlockerCount={dynamicBlockerCount} />
      {/* ═══ 2. LINK STATE ═══ */}
      {linkDebug && (
        <Box style={S.section}>
          <Box style={S.sectionTitle}>Link State</Box>
          <Box style={S.infoBox}>
            <DescRow label="Link Pos" desc="Link's absolute world position in pixels. Indoor: relative to room origin. Outdoor: relative to overworld origin (0,0 = top-left of screen 0x00).">
              <Text style={{ color: '#aac' }}>{linkX}, {linkY}</Text>
            </DescRow>
            {!isIndoors && (
              <DescRow label="World Pos" desc="Link's full world coordinates in pixels (same as Link Pos for outdoor). Used to calculate which overworld screen Link is actually standing on.">
                <Text style={{ color: '#7f7' }}>({linkDebug.linkX}, {linkDebug.linkY})</Text>
              </DescRow>
            )}
            <DescRow label="Relative" desc="Link's position relative to the current 512×512 screen/room origin in pixels.">
              <Text style={{ color: '#7f7' }}>({linkDebug.relX}, {linkDebug.relY})</Text>
            </DescRow>
            <DescRow label="Sub-tile" desc="The 8×8 tile range Link's hitbox currently overlaps. Row and column are in tile coordinates (0–63 per screen).">
              <Text style={{ color: '#7f7' }}>r{linkDebug.tileMinRow}–{linkDebug.tileMaxRow} c{linkDebug.tileMinCol}–{linkDebug.tileMaxCol}</Text>
            </DescRow>
            <DescRow label="Map16" desc="The 16×16 metatile coordinate Link occupies. Map16 tiles are the collision unit — each contains four 8×8 sub-tiles.">
              <Text style={{ color: '#7f7' }}>({linkDebug.map16Row}, {linkDebug.map16Col})</Text>
            </DescRow>
            {!isIndoors && (
              <DescRow label="Live Screen" desc="The overworld screen Link is physically standing on right now (may differ from the 'Screen' in Game State during scrolling transitions).">
                <Text style={{ color: '#7f7' }}>0x{linkDebug.liveScreenIndex.toString(16).toUpperCase()}</Text>
              </DescRow>
            )}
            {linkDebug.linkLayer !== null && (
              <DescRow label="Layer" desc="Link's current collision layer (link_is_on_lower_level). 0=Upper/BG2 (drawn behind BG1), 1=Lower/BG1 (drawn in front). Can change via staircases if not blocked.">
                <Text style={{ color: linkDebug.linkLayer === 0 ? '#7ff' : '#ff7' }}>
                  {linkDebug.linkLayer === 0 ? '0 (upper/BG2)' : '1 (lower/BG1)'}
                </Text>
              </DescRow>
            )}
            {linkDebug.collisionType !== null && linkDebug.collisionType >= 0 && (
              <DescRow label="Collision" desc="Room collision type (room_is_dark byte bits). 0=single layer, 1=both layers active, 2=both+scroll, 3=moving floor, 4=water/swim. Determines which BG layers have collision.">
                <Text style={{ color: '#f9a' }}>
                  {linkDebug.collisionType} ({['One','Both','Both+Scroll','MovFloor','Swim'][linkDebug.collisionType] ?? '?'})
                </Text>
              </DescRow>
            )}
            {linkDebug.staircaseType !== null && linkDebug.staircaseType >= 0 && (
              <DescRow label="Staircase" desc="Controls layer-change behavior (kind_of_in_room_staircase). 0=intra-room stairs (layer+room shift), 1=layer stairs (changes allowed), 2=pseudo/water stairs (ALL layer changes BLOCKED).">
                <Text style={{ color: linkDebug.staircaseType === 2 ? '#f55' : '#5f5' }}>
                  {linkDebug.staircaseType} ({['IntraRoom','Layer','Blocked'][linkDebug.staircaseType] ?? '?'})
                </Text>
              </DescRow>
            )}
          </Box>
        </Box>
      )}

      {/* ═══ 4. FUNCTIONS ═══ */}
      <Box style={S.section}>
        <Box style={S.sectionTitle}>Functions</Box>
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box as="button" data-testid="nav-flood-btn" style={{ ...S.btn, ...(running ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running}>
            {running ? '⏳' : '▶'} Flood Fill
          </Box>
          <Box as="button" style={{ ...S.btn, ...(result ? {} : S.btnDisabled) }} onClick={toggleOverlay} disabled={!result}>
            {overlayStore.visible ? '👁 Hide' : '👁 Show'}
          </Box>
          <Box
            as="button"
            style={{ ...S.btn, ...(autoRun ? S.btnActive : {}) }}
            onClick={() => { setAutoRun(a => !a); if (!autoRun && !running) handleRun(); }}
          >
            ⟳ Auto
          </Box>
        </Box>
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          <TileRecorderBtn attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />
          <PathCopyBtn />
        </Box>
        {/* Summary stats */}
        {result && (
          <Box style={{ ...S.infoBox, marginTop: 4 }}>
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Reachable</Text>
              <Text>{reachableSum}/{totalTilesSum} ({totalTilesSum > 0 ? (reachableSum / totalTilesSum * 100).toFixed(0) : '0'}%)</Text>
            </Box>
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Entrances</Text>
              <Text>{entranceSum}</Text>
            </Box>
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Edges</Text>
              <Text>{externalConnections.length}{internalConnections.length > 0 ? ` + ${internalConnections.filter(c => !c.isIntraRoom || c.edge === 'south' || c.edge === 'east').length} int` : ''}</Text>
            </Box>
          </Box>
        )}
      </Box>

      <ConnectionsPanel entranceSum={entranceSum} renderResults={renderResults} screenBundle={screenBundle} isDarkWorld={isDarkWorld} roomIndex={roomIndex} isIndoors={isIndoors} respawnEntIds={respawnEntIds} entranceSpawns={entranceSpawns} externalConnections={externalConnections} internalConnections={internalConnections} fallHoleLandings={fallHoleLandings} linkDebug={linkDebug} />
    </Box>
  );
};

export { NavigationWidgetContent };
