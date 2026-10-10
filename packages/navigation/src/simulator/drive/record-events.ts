/* @layer bridge-wasm @kind logic */
import type { SimEvent, DetectedCheck, RecorderState } from '../../simulation';
import { getCheck } from '@rotp/game-data';
import { recordCheck } from '../../simulation';
import { locationForScreen } from '../screen-location';
import type { CheckLog, CheckMoment } from './drive.type';

const recordEvents = (recorder: RecorderState, events: SimEvent[], checks: CheckLog[], at: CheckMoment): void => {
  const { pathIndex, step, items } = at;
  for (const event of events) {
    const detected = (event.data as { detected?: DetectedCheck } | undefined)?.detected;
    const checkId = detected?.checkId;
    if (!detected || !checkId) continue;
    const loc = locationForScreen(detected.at.screenId);
    recordCheck(recorder, { checkId, screenId: detected.at.screenId, roomId: loc?.roomId ?? 0, tile: detected.at.tile });
    checks.push({ checkId, name: getCheck(checkId).name, screenId: detected.at.screenId, atPathIndex: pathIndex, step, items });
  }
};

export { recordEvents };
