/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { S } from './styles';
import { ScreenMapWithConnections } from './sub-components';
import { FunctionsPanel } from './sub-components/FunctionsPanel';
import { GameStatePanel } from './sub-components/GameStatePanel';
import { PlayerStatePanel } from './sub-components/PlayerStatePanel';
import { ConnectionsPanel } from './sub-components/ConnectionsPanel';
import { ScreenPanel } from './sub-components/ScreenPanel';
import { ActiveStates } from './sub-components/ActiveStates';
import { useNavigation } from './useNavigation';

const NavigationWidgetContent = () => {
  const {
    screenBundle, screenName, screenId, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, externalEdges, crossings, renderResults, playerDebug, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, gameStates, displayedVariant, dynamicBlockerCount, playerX, playerY, running, handleRun, result, handleClear, overlayStore, mode, setMode, reachableSum, totalTilesSum, entranceSum, internalConnections,
  } = useNavigation();

  return (
    <Box style={S.root}>
      <Box style={S.section}>
        <Box style={S.locName}>
          {screenBundle ? screenBundle.name : screenName}
          {screenBundle?.isMulti && <Text style={S.multiCount}>({screenBundle.screens.length} {isIndoors ? 'rooms' : 'screens'})</Text>}
        </Box>
        <Box style={S.meta}>
          {screenId ?? 'unmapped'} · 0x{(isIndoors ? roomIndex : overworldScreenIndex).toString(16).toUpperCase()} · {isIndoors ? 'INDOOR' : (isDarkWorld ? 'DW' : 'LW')}
          {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
        </Box>

        {screenBundle && (
          <ScreenMapWithConnections bundle={screenBundle} connections={externalConnections} renderResults={renderResults} playerScreenIndex={playerDebug?.liveScreenIndex ?? null} playerPos={playerDebug ? { screen: playerDebug.liveScreenIndex, row: playerDebug.tileMinRow, col: playerDebug.tileMinCol } : null} />
        )}
      </Box>

      <FunctionsPanel mode={mode} setMode={setMode} running={running} handleRun={handleRun} handleClear={handleClear} result={result} overworldScreenIndex={overworldScreenIndex} reachableSum={reachableSum} totalTilesSum={totalTilesSum} entranceSum={entranceSum} externalConnections={externalConnections} internalConnections={internalConnections} />

      <GameStatePanel isIndoors={isIndoors} palaceIndex={palaceIndex} roomIndex={roomIndex} dungeonMapPos={dungeonMapPos} roomLayoutInfo={roomLayoutInfo} whichEntrance={whichEntrance} roomStartLayer={roomStartLayer} overworldScreenIndex={overworldScreenIndex} isDarkWorld={isDarkWorld} progressInfo={progressInfo} displayedVariant={displayedVariant} dynamicBlockerCount={dynamicBlockerCount} />
      <ActiveStates states={gameStates} />

      <PlayerStatePanel playerDebug={playerDebug} isIndoors={isIndoors} playerX={playerX} playerY={playerY} />

      <ScreenPanel annotations={overlayStore.annotations} />

      <ConnectionsPanel entranceSum={entranceSum} crossings={crossings} screenBundle={screenBundle} isIndoors={isIndoors} externalEdges={externalEdges} internalConnections={internalConnections} playerDebug={playerDebug} />
    </Box>
  );
};

export { NavigationWidgetContent };
