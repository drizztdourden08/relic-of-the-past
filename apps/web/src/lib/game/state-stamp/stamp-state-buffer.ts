/* @layer renderer-lib @kind logic */
import { CURRENT_STATE_FORMAT, appendStamp, readSnapshotBytes, readStamp } from '@shared/game/save-state';
import { log } from '../../log-bus';
import { stateStampState } from './state-stamp-state';
import { STAMP_VERSION, UNKNOWN_APP_VERSION } from './state-stamp.constants';

const appVersion = async (): Promise<string> => {
  if (stateStampState.cachedVersion === null) {
    stateStampState.cachedVersion = await window.api.updater.getVersion().catch(() => UNKNOWN_APP_VERSION);
  }
  return stateStampState.cachedVersion;
};

const reportDriftOncePerSession = (produced: number | null): void => {
  if (stateStampState.driftReported) return;
  stateStampState.driftReported = true;
  log.error(
    `[SaveState] Layout drift: the core wrote ${produced} snapshot bytes, but this build `
    + `declares ${CURRENT_STATE_FORMAT.totalBytes} (format ${CURRENT_STATE_FORMAT.id}). `
    + 'Re-run the layout probe and add a KNOWN_FORMATS row before releasing.',
  );
};

const stampStateBuffer = async (data: ArrayBuffer): Promise<ArrayBuffer> => {
  const produced = readSnapshotBytes(data);
  if (produced !== CURRENT_STATE_FORMAT.totalBytes) reportDriftOncePerSession(produced);

  const dialog = readStamp(data)?.dialog;
  return appendStamp(data, {
    v: STAMP_VERSION,
    app: await appVersion(),
    formatId: CURRENT_STATE_FORMAT.id,
    at: Date.now(),
    ...(dialog ? { dialog } : {}),
  });
};

export { stampStateBuffer };
