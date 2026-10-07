/* @layer renderer-lib @kind logic */
/**
 * Stamps outgoing save state bytes with the version and format that produced them.
 *
 * Applied at the storage boundary, not at each call site, so quick slots, manual
 * saves and auto-saves are all covered by one write path.
 *
 * Also where layout drift gets caught: the bytes the core just produced are already in
 * hand, so comparing their snapshot length against the generated constant costs nothing.
 * If a C change moves the layout, this fires the first time anyone saves, long before a
 * release, and without needing the probe to run.
 */
import { CURRENT_STATE_FORMAT, appendStamp, readSnapshotBytes } from '@shared/game/save-state';
import { log } from '../log-bus';

let cachedVersion: string | null = null;
let driftReported = false;

const appVersion = async (): Promise<string> => {
  if (cachedVersion === null) {
    cachedVersion = await window.api.updater.getVersion().catch(() => 'unknown');
  }
  return cachedVersion;
};

/** Once per session. A wrong layout is a standing condition, not a per-save event. */
const reportDrift = (produced: number | null): void => {
  if (driftReported) return;
  driftReported = true;
  log.error(
    `[SaveState] Layout drift: the core wrote ${produced} snapshot bytes, but this build `
    + `declares ${CURRENT_STATE_FORMAT.totalBytes} (format ${CURRENT_STATE_FORMAT.id}). `
    + 'Re-run the layout probe and add a KNOWN_FORMATS row before releasing.',
  );
};

const stampStateBuffer = async (data: ArrayBuffer): Promise<ArrayBuffer> => {
  const produced = readSnapshotBytes(data);
  if (produced !== CURRENT_STATE_FORMAT.totalBytes) reportDrift(produced);

  return appendStamp(data, {
    v: 1,
    app: await appVersion(),
    formatId: CURRENT_STATE_FORMAT.id,
    at: Date.now(),
  });
};

export { stampStateBuffer };
