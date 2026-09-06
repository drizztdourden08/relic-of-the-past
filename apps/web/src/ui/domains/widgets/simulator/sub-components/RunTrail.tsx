/* @layer renderer-widgets @kind component */
/**
 * The route the run actually walked, in order, with the checks each stop earned.
 *
 * The event log answers "what happened". This answers "where did it go", the
 * question you ask when a run ends somewhere unexpected. Stops come from the
 * engine's own currentScreen, so the trail cannot disagree with the run.
 */
import { Box, Text } from '@ds/primitives';
import { getScreen } from '@shared/game/data';
import type { ScreenId } from '@shared/game/data';
import type { TrailStop } from '@app/stores/simulator-store';
import { haulAt } from './trail-haul';

interface RunTrailProps {
  trail: TrailStop[];
  /** Checks completed at the moment of reading, which closes out the last stop. */
  checksDone: number;
}

const RunTrail = ({ trail, checksDone }: RunTrailProps) => {
  if (trail.length === 0) return null;

  return (
    <Box className="simulator__trail">
      <Text className="simulator__trail-title">Route ({trail.length} stops)</Text>
      {trail.map((stop, i) => {
        const haul = haulAt(trail, i, checksDone);
        const screen = getScreen(stop.screenId as ScreenId);
        return (
          <Box key={`${i}-${stop.screenId}`} className="simulator__trail-row">
            <Text className="simulator__trail-index">{i + 1}</Text>
            <Text className="simulator__trail-name">{screen.vanillaName ?? screen.randomizerName}</Text>
            {haul > 0 && <Text className="simulator__trail-haul">+{haul}</Text>}
            <Text className="simulator__trail-epoch">e{stop.epoch}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export { RunTrail };
