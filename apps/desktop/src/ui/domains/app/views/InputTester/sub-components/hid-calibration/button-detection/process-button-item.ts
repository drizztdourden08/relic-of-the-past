/* @layer renderer-components @kind logic */
import type { InputItem } from '../hid-calibration.type';
import { buildButtonMapping, describeButtonMapping, findButtonBits, pickBestButtonDiff } from '../hid-analysis';
import { ignoredForDetection } from '../noisy-bytes';
import { DETECT_LOG_INTERVAL_MS } from './button-detection.constants';
import { scheduleAdvance } from './schedule-advance';
import type { ButtonCallbacks, ButtonRefs } from './button-detection.type';

const diffKey = (d: { byteIndex: number; bitMask: number }): string => `${d.byteIndex}:${d.bitMask}`;

const sortedList = (values: Iterable<number>): string => [...values].sort((a, b) => a - b).join(',');

const processButtonItem = (bytes: Uint8Array, item: InputItem, idx: number, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  if (item.status === 'captured' || item.status === 'skipped') return;
  const bl = refs.baselineRef.current;
  const excl = ignoredForDetection(refs.excludedRef.current, refs.noiseRef.current);
  const diffs = findButtonBits(bl, bytes, excl);

  if (refs.awaitingButtonRestRef.current) {
    refs.heldAtActivationRef.current = new Set(diffs.map(diffKey));
    refs.awaitingButtonRestRef.current = false;
    cb.addLog(`[detect] ${item.label}: baseline=${bl.length}B excluded=[${sortedList(refs.excludedRef.current)}] restless=[${sortedList(refs.noiseRef.current.noisy)}] alreadyDiffering=[${[...refs.heldAtActivationRef.current].join(' ')}]`);
    return;
  }

  const held = refs.heldAtActivationRef.current;
  const fresh = diffs.filter((d) => !held.has(diffKey(d)));
  if (fresh.length === 0) {
    if (diffs.length > 0 && Date.now() - refs.lastDetectLogAtRef.current > DETECT_LOG_INTERVAL_MS) {
      refs.lastDetectLogAtRef.current = Date.now();
      cb.addLog(`[detect] ${item.label}: ${diffs.length} byte(s) changed but all filtered: [${diffs.map(diffKey).join(' ')}]`);
    }
    return;
  }
  const best = pickBestButtonDiff(fresh);
  const mapping = buildButtonMapping(best);
  const result = describeButtonMapping(mapping);
  cb.addLog(`✓ ${item.label}: ${result}`);
  cb.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'captured' as const, result, mapping } : it));
  cb.updateByteStatuses(bytes.length);
  if (refs.autoAdvanceRef.current) scheduleAdvance(refs, cb);
};

export { processButtonItem };
