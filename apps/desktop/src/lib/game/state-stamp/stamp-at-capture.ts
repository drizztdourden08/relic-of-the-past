/* @layer renderer-lib @kind logic */
import type { StateStamp } from '@shared/game/save-state';
import { CURRENT_STATE_FORMAT, appendStamp } from '@shared/game/save-state';
import { stateStampState } from './state-stamp-state';
import { STAMP_VERSION, UNKNOWN_APP_VERSION } from './state-stamp.constants';

const stampAtCapture = (data: ArrayBuffer, captured: Pick<StateStamp, 'dialog'>): ArrayBuffer =>
  appendStamp(data, {
    v: STAMP_VERSION,
    app: stateStampState.cachedVersion ?? UNKNOWN_APP_VERSION,
    formatId: CURRENT_STATE_FORMAT.id,
    at: Date.now(),
    ...captured,
  });

export { stampAtCapture };
