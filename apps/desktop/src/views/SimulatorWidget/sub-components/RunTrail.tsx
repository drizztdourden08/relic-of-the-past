/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { getScreen } from '@rotp/game-data';
import { screenName } from '@app/game/record-text';
import { haulAt } from '../behavior/trail-haul';
import type { RunTrailProps } from '../SimulatorWidget.type';

const RunTrail = ({ trail, checksDone }: RunTrailProps) => {
  const t = useT();
  if (trail.length === 0) return null;

  return (
    <Box className="simulator__trail">
      <Text className="simulator__trail-title">{t('views-simulator:trail.title', { count: trail.length })}</Text>
      {trail.map((stop, i) => {
        const haul = haulAt(trail, i, checksDone);
        const screen = getScreen(stop.screenId);
        return (
          <Box key={`${i}-${stop.screenId}`} className="simulator__trail-row">
            <Text className="simulator__trail-index">{i + 1}</Text>
            <Text className="simulator__trail-name">{screenName(screen)}</Text>
            {haul > 0 && <Text className="simulator__trail-haul">+{haul}</Text>}
            <Text className="simulator__trail-epoch">e{stop.epoch}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export { RunTrail };
