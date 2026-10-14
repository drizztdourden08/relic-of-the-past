/* @layer renderer-widgets @kind logic */
import { recordTransition } from '@rotp/navigation';
import type { RunContext, RunCursor, RunStepResult } from '../SimulatorWidget.type';
import { SEQUENCE_PREFIX } from '../SimulatorWidget.constants';
import { computeProgress } from './compute-progress';
import { fanOutEvents } from './fan-out-events';
import { frontierEvents } from './frontier-events';
import { isFrontierReseeded } from './is-frontier-reseeded';
import { sequenceEvent } from './sequence-event';

const afterStep = (ctx: RunContext, cursor: RunCursor, previous: { screenId: string; epoch: number }, result: RunStepResult): void => {
  const { writer, store, recorder, detectCache } = ctx;
  const { events, nextState } = result;
  if (nextState.virtual.screenId !== previous.screenId) recordTransition(recorder, previous.screenId, nextState.virtual.screenId);

  const seqChange = sequenceEvent(cursor.sequenceLabel, nextState.step);
  if (seqChange) {
    cursor.sequenceLabel = seqChange.msg.slice(SEQUENCE_PREFIX.length);
    fanOutEvents([seqChange], writer, store.pushEvents, recorder);
  }
  if (isFrontierReseeded(previous.screenId, previous.epoch, nextState)) {
    const followups = frontierEvents(nextState, detectCache);
    if (followups.length > 0) fanOutEvents(followups, writer, store.pushEvents, recorder);
  }

  store.setProgress(computeProgress(nextState));
  const lastNarrative = [...events].reverse().find((e) => e.level === 'narrative');
  if (lastNarrative) store.setPhaseLabel(lastNarrative.msg);
};

export { afterStep };
