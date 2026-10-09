/* @layer renderer-components @kind logic */
import type { StickCandidate } from '../hid-calibration.type';
import { STICK_RANGE_THRESHOLD, STICK_STABLE_FRAMES } from '../hid-calibration.constants';
import { findCounterBytes } from '../hid-analysis';
import { reclaimGyroExcludedStickBytes, shouldAttemptGyroReclaim } from '../stick-gyro-reclaim';
import { extremesCandidate } from './extremes-candidate';
import { trackExtremes } from './track-extremes';
import {
  DEFAULT_STICK_CENTER, PROCESS_EVERY_FRAMES, STICK_BUFFER_FRAMES, STICK_CANDIDATE_MIN_RANGE, STICK_COUNTER_MIN_FRAMES,
} from './report-processing.constants';
import type { StickRefs } from './report-processing.type';

const stickLiveInfo = ([first, second]: StickCandidate[]): string => {
  if (first && second) return `byte[${first.idx}] range=${first.range}  |  byte[${second.idx}] range=${second.range}`;
  if (first) return `byte[${first.idx}] range=${first.range}  |  waiting for 2nd axis...`;
  return 'No candidates yet. Keep rotating...';
};

const processStickFrame = (bytes: Uint8Array, refs: StickRefs, onLiveInfo: (info: string) => void, onFinalize: (c1: StickCandidate, c2: StickCandidate | null) => void, onStopRecording: () => void, addLog: (msg: string) => void): void => {
  const len = bytes.length;
  const mins = refs.stickMinsRef.current;
  const maxs = refs.stickMaxsRef.current;
  trackExtremes(bytes, mins, maxs);
  refs.stickSamplesRef.current++;
  refs.stickBufferRef.current.push(new Uint8Array(bytes));
  if (refs.stickBufferRef.current.length > STICK_BUFFER_FRAMES) refs.stickBufferRef.current.shift();

  if (refs.stickSamplesRef.current % PROCESS_EVERY_FRAMES !== 0) return;

  if (refs.stickBufferRef.current.length >= STICK_COUNTER_MIN_FRAMES) {
    refs.stickCounterBytesRef.current = findCounterBytes(refs.stickBufferRef.current);
  }
  const ctrBytes = refs.stickCounterBytesRef.current;
  const candidates: StickCandidate[] = [];
  const prevStickBytes = refs.capturedStickBytesRef.current;
  for (let i = 0; i < len; i++) {
    if (prevStickBytes.has(i) || refs.excludedRef.current.has(i) || ctrBytes.has(i)) continue;
    const candidate = extremesCandidate(mins, maxs, i, refs.baselineRef.current[i] ?? DEFAULT_STICK_CENTER);
    if (candidate && candidate.range >= STICK_CANDIDATE_MIN_RANGE) candidates.push(candidate);
  }
  candidates.sort((a, b) => b.range - a.range);
  const top2 = candidates.slice(0, 2);

  if (shouldAttemptGyroReclaim(refs, top2.length)) {
    refs.stickReclaimAttemptedRef.current = true;
    reclaimGyroExcludedStickBytes(refs, mins, maxs, addLog);
    return;
  }

  onLiveInfo(stickLiveInfo(top2));

  const key = top2.map(c => `${c.idx}`).join(',');
  if (key === refs.stickLastTop2Ref.current) {
    refs.stickStableCountRef.current++;
  } else {
    refs.stickStableCountRef.current = 0;
    refs.stickLastTop2Ref.current = key;
  }

  const [first, second] = top2;
  if (first && second && first.range >= STICK_RANGE_THRESHOLD && second.range >= STICK_RANGE_THRESHOLD
      && refs.stickStableCountRef.current >= STICK_STABLE_FRAMES) {
    onStopRecording();
    onFinalize(first, second);
  }
};

export { processStickFrame };
