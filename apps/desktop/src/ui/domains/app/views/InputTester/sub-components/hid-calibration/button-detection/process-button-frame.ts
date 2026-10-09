/* @layer renderer-components @kind logic */
import { ignoredForDetection } from '../noisy-bytes';
import { processButtonItem } from './process-button-item';
import { processAxisPress } from './process-axis-press';
import { processAxisRelease } from './process-axis-release';
import type { ButtonCallbacks, ButtonRefs } from './button-detection.type';

const processButtonFrame = (bytes: Uint8Array, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  if (!refs.inputPhaseActiveRef.current) return;
  const idx = refs.activeIdxRef.current;
  const item = refs.itemsRef.current[idx];
  if (!item) return;
  if (item.kind === 'button') { processButtonItem(bytes, item, idx, refs, cb); return; }
  if ((item.status === 'captured' || item.status === 'skipped') && refs.captureStateRef.current !== 'waiting-release') return;
  const bl = refs.baselineRef.current;
  const excl = ignoredForDetection(refs.excludedRef.current, refs.noiseRef.current);
  const args = { bytes, bl, excl, item, idx, refs, cb };
  if (refs.captureStateRef.current === 'waiting-release') processAxisRelease(args);
  else processAxisPress(args);
};

export { processButtonFrame };
