/* @layer renderer-widgets @kind logic */
import type { DetectedCheck, RecorderState, SimEvent } from '@rotp/navigation';
import { recordCheck } from '@rotp/navigation';
import { log } from '@app/lib/log-bus';
import { locationForScreen } from '../../../../../../lib/game/simulator/observe';
import type { SimLogSink } from '../../SimulatorWidget.type';

const recordDetectedCheck = (recorder: RecorderState, detected: DetectedCheck): void => {
  const loc = locationForScreen(detected.at.screenId);
  recordCheck(recorder, {
    checkId: detected.checkId ?? null,
    screenId: detected.at.screenId,
    roomId: loc?.roomId ?? 0,
    tile: detected.at.tile,
  });
};

const fanOutEvents = (
  events: SimEvent[],
  sink: SimLogSink,
  pushNarrative: (narrative: SimEvent[]) => void,
  recorder: RecorderState,
): void => {
  const narrative: SimEvent[] = [];
  for (const event of events) {
    sink.write(event);
    if (event.level === 'narrative') {
      narrative.push(event);
      log.sim(event.msg);
    }
    const detected = (event.data as { detected?: DetectedCheck } | undefined)?.detected;
    if (detected) recordDetectedCheck(recorder, detected);
  }
  if (narrative.length > 0) pushNarrative(narrative);
};

export { fanOutEvents };
