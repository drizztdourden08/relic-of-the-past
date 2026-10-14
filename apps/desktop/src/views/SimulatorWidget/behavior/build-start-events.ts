/* @layer renderer-widgets @kind logic */
import type { SimConfig, SimEvent } from '@rotp/navigation';
import { screenLabel } from '@rotp/navigation';
import { getCheck } from '@rotp/game-data';
import { screenAreaInfo } from '@app/game/simulator';
import type { DetectCache } from '@app/game/simulator/observe';
import { SEQUENCE_PREFIX } from '../SimulatorWidget.constants';
import type { RunCursor } from '../SimulatorWidget.type';
import { frontierEvents } from './frontier-events';
import { sequenceEvent } from './sequence-event';

const buildStartEvents = (cursor: RunCursor, detectCache: DetectCache, config: SimConfig): SimEvent[] => {
  const { state } = cursor;
  const stopLabel = config.stopAtCheckId ? `stop at "${getCheck(config.stopAtCheckId).name}", ` : '';
  const events: SimEvent[] = [
    { level: 'narrative', msg: `Run config: ${stopLabel}screen limit ${config.screenLimit ?? 'unlimited'}`, step: state.step },
  ];
  const seq = sequenceEvent(cursor.sequenceLabel, state.step);
  if (seq) {
    events.push(seq);
    cursor.sequenceLabel = seq.msg.slice(SEQUENCE_PREFIX.length);
  }
  state.area = screenAreaInfo(state.virtual.screenId);
  if (state.area) events.push({ level: 'narrative', msg: `Area ${state.area.label} (${state.area.size} sub-screens)`, step: state.step });
  events.push({ level: 'narrative', msg: `Screen ${screenLabel(state.virtual.screenId)}`, step: state.step });
  events.push({ level: 'narrative', msg: `START at ${state.virtual.tile.col},${state.virtual.tile.row}`, step: state.step });
  events.push(...frontierEvents(state, detectCache));
  return events;
};

export { buildStartEvents };
