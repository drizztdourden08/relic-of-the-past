/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { FunctionsPanel } from './sub-components/FunctionsPanel';
import { GameStatePanel } from './sub-components/GameStatePanel';
import { LocationSection } from './sub-components/LocationSection';
import { PlayerStatePanel } from './sub-components/PlayerStatePanel';
import { ConnectionsPanel } from './sub-components/ConnectionsPanel';
import { ScreenPanel } from './sub-components/ScreenPanel';
import { ActiveStates } from './sub-components/ActiveStates';
import { useNavigation } from './behavior/useNavigation';
import './NavigationWidget.css';

const NavigationWidgetContent = () => {
  const {
    screenBundle, screenName, screenId, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, externalEdges, crossings, renderResults, playerDebug, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, gameStates, displayedVariant, dynamicBlockerCount, playerX, playerY, running, handleRun, result, handleClear, overlayStore, mode, setMode, reachableSum, totalTilesSum, entranceSum, internalConnections,
  } = useNavigation();

  return (
    <Box className="nav-navigation-widget__root">
      <LocationSection
        screenBundle={screenBundle}
        screenName={screenName}
        screenId={screenId}
        isIndoors={isIndoors}
        roomIndex={roomIndex}
        isDarkWorld={isDarkWorld}
        overworldScreenIndex={overworldScreenIndex}
        externalConnections={externalConnections}
        renderResults={renderResults}
        playerDebug={playerDebug}
      />

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
