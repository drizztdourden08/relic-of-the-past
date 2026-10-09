/* @layer bridge-wasm @kind logic */
import type { SimEvent, DetectedCheck, RecorderState } from '@shared/game/simulation';
import { getCheck } from '@rotp/game-data';
import { recordCheck } from '@shared/game/simulation';
import { locationForScreen } from '../screen-location';
import type { CheckLog } from './drive.type';

const recordEvents = (recorder: RecorderState, events: SimEvent[], checks: CheckLog[], pathIndex: number, step: number, items: string[]): void => {
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
