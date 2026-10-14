/* @layer renderer-widgets @kind logic */
import type { EngineState, SimEvent } from '@rotp/navigation';
import type { DetectCache } from '@app/game/simulator/observe';
import { screenFloodEvent } from './screen-flood-event';
import { exitsEvent } from './exits-event';

const frontierEvents = (state: EngineState, detectCache: DetectCache): SimEvent[] => {
  const flood = screenFloodEvent(state, detectCache);
  const exits = exitsEvent(state, detectCache);
  return [flood, exits].filter((event): event is SimEvent => event !== null);
};

export { frontierEvents };
