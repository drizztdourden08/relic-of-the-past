/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { hexLabelOf } from '../behavior/hex-label-of';
import { playerMapPosOf } from '../behavior/player-map-pos-of';
import { worldTag } from '../behavior/world-tag';
import { LocationName } from './LocationName';
import { ScreenMapWithConnections } from './ScreenMapWithConnections';
import type { LocationSectionProps } from './LocationSection.type';

const LocationSection = (props: LocationSectionProps) => {
  const {
    screenBundle, screenName, screenId, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex,
    externalConnections, renderResults, playerDebug,
  } = props;

  return (
    <Box className="nav-section">
      <LocationName screenBundle={screenBundle} screenName={screenName} isIndoors={isIndoors} />
      <Box className="nav-meta">
        {screenId ?? 'unmapped'} · {hexLabelOf(isIndoors ? roomIndex : overworldScreenIndex, 0)} · {worldTag(isIndoors, isDarkWorld)}
        {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
      </Box>

      {screenBundle && (
        <ScreenMapWithConnections
          bundle={screenBundle}
          connections={externalConnections}
          renderResults={renderResults}
          playerScreenIndex={playerDebug?.liveScreenIndex ?? null}
          playerPos={playerMapPosOf(playerDebug)}
        />
      )}
    </Box>
  );
};

export { LocationSection };
