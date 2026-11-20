/* @layer renderer-widgets @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SimConfig, SimEvent } from '@rotp/navigation';
import { getCheck } from '@rotp/game-data';
import { optionText } from '@rotp/randomizer';
import { checkName, screenLabel } from '@app/game/record-text';
import { screenAreaInfo } from '@app/game/simulator';
import type { DetectCache } from '@app/game/simulator/observe';
import type { RunCursor } from '../SimulatorWidget.type';
import { codedEvent } from './coded-event';
import { sequenceLabelOf } from './sequence-label-of';
import { frontierEvents } from './frontier-events';
import { sequenceEvent } from './sequence-event';

const runConfigMessage = (config: SimConfig) => {
  const limit = config.screenLimit === undefined
    ? optionText(msg('views-simulator:event.limit.unlimited'))
    : String(config.screenLimit);
  return config.stopAtCheckId
    ? msg('views-simulator:event.run-config.stop', { check: checkName(getCheck(config.stopAtCheckId)), limit })
    : msg('views-simulator:event.run-config', { limit });
};

const buildStartEvents = (cursor: RunCursor, detectCache: DetectCache, config: SimConfig): SimEvent[] => {
  const { state } = cursor;
  const events: SimEvent[] = [codedEvent('run-config', runConfigMessage(config), state.step)];
  const seq = sequenceEvent(cursor.sequenceLabel, state.step);
  if (seq) {
    events.push(seq);
    cursor.sequenceLabel = sequenceLabelOf(seq);
  }
  state.area = screenAreaInfo(state.virtual.screenId);
  if (state.area) {
    events.push(codedEvent('area', msg('views-simulator:event.area', { label: state.area.label, size: state.area.size }), state.step));
  }
  events.push(codedEvent('screen', msg('views-simulator:event.screen', { label: screenLabel(state.virtual.screenId) }), state.step));
  const { col, row } = state.virtual.tile;
  events.push(codedEvent('start', msg('views-simulator:event.start', { col, row }), state.step, { col, row }));
  events.push(...frontierEvents(state, detectCache));
  return events;
};

export { buildStartEvents };
