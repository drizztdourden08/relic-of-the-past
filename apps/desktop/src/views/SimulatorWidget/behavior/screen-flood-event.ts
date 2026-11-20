/* @layer renderer-widgets @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { EngineState, SimEvent } from '@rotp/navigation';
import { screenLabel } from '@rotp/navigation';
import { detectFor } from '../../../game/simulator/observe/index';
import type { DetectCache } from '../../../game/simulator/observe/index';
import { codedEvent } from './coded-event';

const screenFloodEvent = (state: EngineState, cache: DetectCache): SimEvent | null => {
  const flood = detectFor(state, cache)?.flood;
  if (!flood) return null;
  const values = {
    label: screenLabel(state.virtual.screenId),
    reachable: flood.reachableCount,
    total: flood.totalTiles,
    entrances: flood.entranceCount,
    edges: flood.edgeCount,
  };
  const text = flood.intraCount > 0
    ? msg('views-simulator:event.flood.internal', { ...values, internal: flood.intraCount })
    : msg('views-simulator:event.flood', values);
  return codedEvent('flood', text, state.step);
};

export { screenFloodEvent };
