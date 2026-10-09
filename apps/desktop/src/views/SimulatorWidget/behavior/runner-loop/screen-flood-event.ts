/* @layer renderer-widgets @kind logic */
import type { EngineState, SimEvent } from '@rotp/navigation';
import { screenLabel } from '@rotp/navigation';
import { detectFor } from '../../../../game/simulator/observe';
import type { DetectCache } from '../../../../game/simulator/observe';

const screenFloodEvent = (state: EngineState, cache: DetectCache): SimEvent | null => {
  const flood = detectFor(state, cache)?.flood;
  if (!flood) return null;
  const intra = flood.intraCount > 0 ? ` (+${flood.intraCount} int)` : '';
  return {
    level: 'narrative',
    msg: `flood ${screenLabel(state.virtual.screenId)}: reachable ${flood.reachableCount}/${flood.totalTiles}, entrances ${flood.entranceCount}, edges ${flood.edgeCount}${intra}`,
    step: state.step,
  };
};

export { screenFloodEvent };
