/* @layer renderer-widgets @kind data */
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
    <div style={S.root}>
      {/* ═══ 1. BUNDLE TITLE + SCREEN MAP ═══ */}
      <div style={S.section}>
        <div style={S.locName}>
          {screenBundle ? screenBundle.name : screenName}
          {screenBundle?.isMulti && <span style={{ fontSize: 9, color: '#888', marginLeft: 6 }}>({screenBundle.screens.length} {isIndoors ? 'rooms' : 'screens'})</span>}
        </div>
        <div style={S.meta}>
          {isIndoors ? `room-${roomIndex.toString(16).padStart(3, '0')}` : `${isDarkWorld ? 'dw' : 'lw'}-${overworldScreenIndex.toString(16).padStart(2, '0')}`} · {isIndoors ? 'INDOOR' : (isDarkWorld ? 'DW' : 'LW')}
          {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
        </div>

        {/* Screen map with edge connection indicators */}
        {screenBundle && (
          <ScreenMapWithConnections bundle={screenBundle} connections={externalConnections} renderResults={renderResults} linkScreenIndex={linkDebug?.liveScreenIndex ?? null} linkPos={linkDebug ? { screen: linkDebug.liveScreenIndex, row: linkDebug.tileMinRow, col: linkDebug.tileMinCol } : null} respawnEntIds={respawnEntIds} />
        )}
      </div>

      <GameStatePanel isIndoors={isIndoors} palaceIndex={palaceIndex} roomIndex={roomIndex} dungeonMapPos={dungeonMapPos} roomLayoutInfo={roomLayoutInfo} whichEntrance={whichEntrance} roomStartLayer={roomStartLayer} overworldScreenIndex={overworldScreenIndex} isDarkWorld={isDarkWorld} progressInfo={progressInfo} displayedVariant={displayedVariant} dynamicBlockerCount={dynamicBlockerCount} />
      {/* ═══ 2. LINK STATE ═══ */}
      {linkDebug && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Link State</div>
          <div style={S.infoBox}>
            <DescRow label="Link Pos" desc="Link's absolute world position in pixels. Indoor: relative to room origin. Outdoor: relative to overworld origin (0,0 = top-left of screen 0x00).">
              <span style={{ color: '#aac' }}>{linkX}, {linkY}</span>
            </DescRow>
            {!isIndoors && (
              <DescRow label="World Pos" desc="Link's full world coordinates in pixels (same as Link Pos for outdoor). Used to calculate which overworld screen Link is actually standing on.">
                <span style={{ color: '#7f7' }}>({linkDebug.linkX}, {linkDebug.linkY})</span>
              </DescRow>
            )}
            <DescRow label="Relative" desc="Link's position relative to the current 512×512 screen/room origin in pixels.">
              <span style={{ color: '#7f7' }}>({linkDebug.relX}, {linkDebug.relY})</span>
            </DescRow>
            <DescRow label="Sub-tile" desc="The 8×8 tile range Link's hitbox currently overlaps. Row and column are in tile coordinates (0–63 per screen).">
              <span style={{ color: '#7f7' }}>r{linkDebug.tileMinRow}–{linkDebug.tileMaxRow} c{linkDebug.tileMinCol}–{linkDebug.tileMaxCol}</span>
            </DescRow>
            <DescRow label="Map16" desc="The 16×16 metatile coordinate Link occupies. Map16 tiles are the collision unit — each contains four 8×8 sub-tiles.">
              <span style={{ color: '#7f7' }}>({linkDebug.map16Row}, {linkDebug.map16Col})</span>
            </DescRow>
            {!isIndoors && (
              <DescRow label="Live Screen" desc="The overworld screen Link is physically standing on right now (may differ from the 'Screen' in Game State during scrolling transitions).">
                <span style={{ color: '#7f7' }}>0x{linkDebug.liveScreenIndex.toString(16).toUpperCase()}</span>
              </DescRow>
            )}
            {linkDebug.linkLayer !== null && (
              <DescRow label="Layer" desc="Link's current collision layer (link_is_on_lower_level). 0=Upper/BG2 (drawn behind BG1), 1=Lower/BG1 (drawn in front). Can change via staircases if not blocked.">
                <span style={{ color: linkDebug.linkLayer === 0 ? '#7ff' : '#ff7' }}>
                  {linkDebug.linkLayer === 0 ? '0 (upper/BG2)' : '1 (lower/BG1)'}
                </span>
              </DescRow>
            )}
            {linkDebug.collisionType !== null && linkDebug.collisionType >= 0 && (
              <DescRow label="Collision" desc="Room collision type (room_is_dark byte bits). 0=single layer, 1=both layers active, 2=both+scroll, 3=moving floor, 4=water/swim. Determines which BG layers have collision.">
                <span style={{ color: '#f9a' }}>
                  {linkDebug.collisionType} ({['One','Both','Both+Scroll','MovFloor','Swim'][linkDebug.collisionType] ?? '?'})
                </span>
              </DescRow>
            )}
            {linkDebug.staircaseType !== null && linkDebug.staircaseType >= 0 && (
              <DescRow label="Staircase" desc="Controls layer-change behavior (kind_of_in_room_staircase). 0=intra-room stairs (layer+room shift), 1=layer stairs (changes allowed), 2=pseudo/water stairs (ALL layer changes BLOCKED).">
                <span style={{ color: linkDebug.staircaseType === 2 ? '#f55' : '#5f5' }}>
                  {linkDebug.staircaseType} ({['IntraRoom','Layer','Blocked'][linkDebug.staircaseType] ?? '?'})
                </span>
              </DescRow>
            )}
          </div>
        </div>
      )}

      {/* ═══ 4. FUNCTIONS ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Functions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button data-testid="nav-flood-btn" style={{ ...S.btn, ...(running ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running}>
            {running ? '⏳' : '▶'} Flood Fill
          </button>
          <button style={{ ...S.btn, ...(result ? {} : S.btnDisabled) }} onClick={toggleOverlay} disabled={!result}>
            {overlayStore.visible ? '👁 Hide' : '👁 Show'}
          </button>
          <button
            style={{ ...S.btn, ...(autoRun ? S.btnActive : {}) }}
            onClick={() => { setAutoRun(a => !a); if (!autoRun && !running) handleRun(); }}
          >
            ⟳ Auto
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          <TileRecorderBtn attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />
          <PathCopyBtn />
        </div>
        {/* Summary stats */}
        {result && (
          <div style={{ ...S.infoBox, marginTop: 4 }}>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Reachable</span>
              <span>{reachableSum}/{totalTilesSum} ({totalTilesSum > 0 ? (reachableSum / totalTilesSum * 100).toFixed(0) : '0'}%)</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Entrances</span>
              <span>{entranceSum}</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Edges</span>
              <span>{externalConnections.length}{internalConnections.length > 0 ? ` + ${internalConnections.filter(c => !c.isIntraRoom || c.edge === 'south' || c.edge === 'east').length} int` : ''}</span>
            </div>
          </div>
        )}
      </div>

      <ConnectionsPanel entranceSum={entranceSum} renderResults={renderResults} screenBundle={screenBundle} isDarkWorld={isDarkWorld} roomIndex={roomIndex} isIndoors={isIndoors} respawnEntIds={respawnEntIds} entranceSpawns={entranceSpawns} externalConnections={externalConnections} internalConnections={internalConnections} fallHoleLandings={fallHoleLandings} linkDebug={linkDebug} />
    </div>
  );
};

export { NavigationWidgetContent };
