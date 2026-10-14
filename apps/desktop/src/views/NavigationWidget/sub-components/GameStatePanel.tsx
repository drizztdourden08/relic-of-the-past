/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import { IndoorBasicRows } from './IndoorBasicRows';
import { IndoorEntranceRows } from './IndoorEntranceRows';
import { IndoorLayoutRows } from './IndoorLayoutRows';
import { OutdoorRows } from './OutdoorRows';
import { ProgressRows } from './ProgressRows';
import type { GameStatePanelProps } from './GameStatePanel.type';
import './GameStatePanel.css';

const GameStatePanel = (props: GameStatePanelProps) => {
  const { isIndoors, palaceIndex, roomIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, overworldScreenIndex, isDarkWorld, progressInfo, displayedVariant, dynamicBlockerCount } = props;
  return (
    <Box className="nav-section">
      <Box className="nav-section-title">Game State</Box>
      <Box className="nav-info-box">
        <DescRow label="Mode" desc="Whether the player is currently indoors (dungeon/cave/house) or outdoors on the overworld.">
          <Text className={isIndoors ? 'nav-val-warning' : 'nav-val-green'}>{isIndoors ? 'Indoor' : 'Outdoor'}</Text>
        </DescRow>
        {isIndoors ? (
          <>
            <IndoorBasicRows palaceIndex={palaceIndex} roomIndex={roomIndex} dungeonMapPos={dungeonMapPos} />
            <IndoorLayoutRows roomLayoutInfo={roomLayoutInfo} dungeonMapPos={dungeonMapPos} />
            <IndoorEntranceRows whichEntrance={whichEntrance} palaceIndex={palaceIndex} roomStartLayer={roomStartLayer} />
          </>
        ) : (
          <OutdoorRows overworldScreenIndex={overworldScreenIndex} isDarkWorld={isDarkWorld} />
        )}
        <ProgressRows progressInfo={progressInfo} displayedVariant={displayedVariant} dynamicBlockerCount={dynamicBlockerCount} />
      </Box>
    </Box>
  );
};

export { GameStatePanel };
