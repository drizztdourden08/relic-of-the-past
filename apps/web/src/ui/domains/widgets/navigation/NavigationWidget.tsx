/* @layer renderer-widgets @kind data */
import { Box, Text, Button } from '../../../design-system/primitives';
import { S } from './styles';
import { ScreenMapWithConnections, TileRecorderBtn, PathCopyBtn } from './sub-components';
import { GameStatePanel } from './sub-components/GameStatePanel';
import { PlayerStatePanel } from './sub-components/PlayerStatePanel';
import { ConnectionsPanel } from './sub-components/ConnectionsPanel';
import { ScreenPanel } from './sub-components/ScreenPanel';
import { ActiveStates } from './sub-components/ActiveStates';
import { useNavigation } from './useNavigation';

const NavigationWidgetContent = () => {
  const {
    screenBundle, screenName, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, renderResults, playerDebug, respawnEntIds, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, gameStates, displayedVariant, dynamicBlockerCount, playerX, playerY, running, handleRun, result, toggleOverlay, overlayStore, autoRun, setAutoRun, reachableSum, totalTilesSum, entranceSum, internalConnections, fallHoleLandings, entranceSpawns,
  } = useNavigation();

  return (
    <Box style={S.root}>
      {/* ═══ 1. BUNDLE TITLE + SCREEN MAP ═══ */}
      <Box style={S.section}>
        <Box style={S.locName}>
          {screenBundle ? screenBundle.name : screenName}
          {screenBundle?.isMulti && <Text style={S.multiCount}>({screenBundle.screens.length} {isIndoors ? 'rooms' : 'screens'})</Text>}
        </Box>
        <Box style={S.meta}>
          {isIndoors ? `room-${roomIndex.toString(16).padStart(3, '0')}` : `${isDarkWorld ? 'dw' : 'lw'}-${overworldScreenIndex.toString(16).padStart(2, '0')}`} · {isIndoors ? 'INDOOR' : (isDarkWorld ? 'DW' : 'LW')}
          {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
        </Box>

        {/* Screen map with edge connection indicators */}
        {screenBundle && (
          <ScreenMapWithConnections bundle={screenBundle} connections={externalConnections} renderResults={renderResults} playerScreenIndex={playerDebug?.liveScreenIndex ?? null} playerPos={playerDebug ? { screen: playerDebug.liveScreenIndex, row: playerDebug.tileMinRow, col: playerDebug.tileMinCol } : null} respawnEntIds={respawnEntIds} />
        )}
      </Box>

      <GameStatePanel isIndoors={isIndoors} palaceIndex={palaceIndex} roomIndex={roomIndex} dungeonMapPos={dungeonMapPos} roomLayoutInfo={roomLayoutInfo} whichEntrance={whichEntrance} roomStartLayer={roomStartLayer} overworldScreenIndex={overworldScreenIndex} isDarkWorld={isDarkWorld} progressInfo={progressInfo} displayedVariant={displayedVariant} dynamicBlockerCount={dynamicBlockerCount} />
      <ActiveStates states={gameStates} />

      {/* ═══ 2. PLAYER STATE ═══ */}
      <PlayerStatePanel playerDebug={playerDebug} isIndoors={isIndoors} playerX={playerX} playerY={playerY} />

      {/* ═══ 4. FUNCTIONS ═══ */}
      <Box style={S.section}>
        <Box style={S.sectionTitle}>Functions</Box>
        <Box style={S.fnRow}>
          <Button variant="bare" data-testid="nav-flood-btn" style={{ ...S.btn, ...(running ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running}>
            {running ? '⏳' : '▶'} Flood Fill
          </Button>
          <Button variant="bare" style={{ ...S.btn, ...(result ? {} : S.btnDisabled) }} onClick={toggleOverlay} disabled={!result}>
            {overlayStore.visible ? '👁 Hide' : '👁 Show'}
          </Button>
          <Button
            variant="bare"
            style={{ ...S.btn, ...(autoRun ? S.btnActive : {}) }}
            onClick={() => { setAutoRun(a => !a); if (!autoRun && !running) handleRun(); }}
          >
            ⟳ Auto
          </Button>
        </Box>
        <Box style={S.fnRowTop}>
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

      <ScreenPanel annotations={overlayStore.annotations} edges={externalConnections} isIndoors={isIndoors} palaceIndex={palaceIndex} />

      <ConnectionsPanel entranceSum={entranceSum} renderResults={renderResults} screenBundle={screenBundle} isDarkWorld={isDarkWorld} roomIndex={roomIndex} isIndoors={isIndoors} respawnEntIds={respawnEntIds} entranceSpawns={entranceSpawns} externalConnections={externalConnections} internalConnections={internalConnections} fallHoleLandings={fallHoleLandings} playerDebug={playerDebug} />
    </Box>
  );
};

export { NavigationWidgetContent };
