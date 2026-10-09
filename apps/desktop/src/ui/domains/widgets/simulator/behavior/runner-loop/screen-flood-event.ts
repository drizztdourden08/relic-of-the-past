/* @layer renderer-widgets @kind logic */
import type { EngineState, SimEvent } from '@shared/game/simulation';
import { screenLabel } from '@shared/game/simulation';
import { detectFor } from '../../../../../../lib/game/simulator/observe';
import type { DetectCache } from '../../../../../../lib/game/simulator/observe';

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
