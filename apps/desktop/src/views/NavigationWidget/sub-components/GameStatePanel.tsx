/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
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
  const t = useT();
  const { isIndoors, palaceIndex, roomIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, overworldScreenIndex, isDarkWorld, progressInfo, displayedVariant, dynamicBlockerCount } = props;
  return (
    <Box className="nav-section">
      <Box className="nav-section-title">{t('views-navigation:gamestate.title')}</Box>
      <Box className="nav-info-box">
        <DescRow id="Mode" label={t('views-navigation:desc.mode.label')} desc={t('views-navigation:desc.mode.text')}>
          <Text className={isIndoors ? 'nav-val-warning' : 'nav-val-green'}>{isIndoors ? t('views-navigation:gamestate.indoor') : t('views-navigation:gamestate.outdoor')}</Text>
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
