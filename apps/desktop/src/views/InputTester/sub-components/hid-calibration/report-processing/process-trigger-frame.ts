/* @layer renderer-components @kind logic */
import type { StickCandidate } from '../hid-calibration.type';
import { TRIGGER_RANGE_THRESHOLD, TRIGGER_STABLE_FRAMES } from '../hid-calibration.constants';
import { classifyTriggerByte } from '../trigger-classify';
import { extremesCandidate } from './extremes-candidate';
import { trackExtremes } from './track-extremes';
import { PROCESS_EVERY_FRAMES, TRIGGER_BUFFER_FRAMES, TRIGGER_CANDIDATE_MIN_RANGE } from './report-processing.constants';
import type { TriggerFrameArgs, TriggerRefs } from './report-processing.type';

const topTriggerCandidate = (refs: TriggerRefs, mins: Uint8Array, maxs: Uint8Array, len: number): StickCandidate | null => {
  const candidates: StickCandidate[] = [];
  for (let i = 0; i < len; i++) {
    if (refs.capturedStickBytesRef.current.has(i) || refs.capturedTriggerBytesRef.current.has(i) || refs.excludedRef.current.has(i)) continue;
    const candidate = extremesCandidate(mins, maxs, i, refs.baselineRef.current[i] ?? 0);
    if (candidate && candidate.range >= TRIGGER_CANDIDATE_MIN_RANGE) candidates.push(candidate);
  }
  candidates.sort((a, b) => b.range - a.range);
  return candidates[0] ?? null;
};

const processTriggerFrame = (args: TriggerFrameArgs): void => {
  const { bytes, refs, onLiveInfo, onFinalize, onStopRecording, onFinalizeDigital } = args;
  const mins = refs.triggerMinsRef.current;
  const maxs = refs.triggerMaxsRef.current;
  trackExtremes(bytes, mins, maxs);
  refs.triggerSamplesRef.current++;
  refs.triggerBufferRef.current.push(new Uint8Array(bytes));
  if (refs.triggerBufferRef.current.length > TRIGGER_BUFFER_FRAMES) refs.triggerBufferRef.current.shift();

  if (refs.triggerSamplesRef.current % PROCESS_EVERY_FRAMES !== 0) return;

  const top1 = topTriggerCandidate(refs, mins, maxs, bytes.length);
  if (!top1) {
    onLiveInfo('No candidates yet. Press and release the trigger...');
    refs.triggerStableCountRef.current = 0;
    refs.triggerLastTopRef.current = '';
    return;
  }

  const verdict = classifyTriggerByte(refs.triggerBufferRef.current, refs.baselineRef.current, top1.idx);
  onLiveInfo(verdict.kind === 'digital'
    ? `byte[${top1.idx}] bit 0x${verdict.bitMask.toString(16)} is a switch with ${verdict.uniqueCount} value(s)`
    : `byte[${top1.idx}] range=${top1.range} (${top1.min}..${top1.max}) with ${verdict.uniqueCount} value(s)`);

  const byteAndKind = `${top1.idx}:${verdict.kind}`;
  if (byteAndKind === refs.triggerLastTopRef.current) {
    refs.triggerStableCountRef.current++;
  } else {
    refs.triggerStableCountRef.current = 0;
    refs.triggerLastTopRef.current = byteAndKind;
  }
  if (refs.triggerStableCountRef.current < TRIGGER_STABLE_FRAMES) return;

  if (verdict.kind === 'digital') {
    onStopRecording();
    onFinalizeDigital({ byteIndex: top1.idx, bitMask: verdict.bitMask });
    return;
  }
  if (verdict.kind === 'analog' && top1.range >= TRIGGER_RANGE_THRESHOLD) {
    onStopRecording();
    onFinalize(top1);
  }
};

export { processTriggerFrame };
