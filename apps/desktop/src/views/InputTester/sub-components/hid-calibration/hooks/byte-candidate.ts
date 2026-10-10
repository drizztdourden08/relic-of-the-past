/* @layer renderer-components @kind logic */
import { BYTE_MAX } from '../hid-calibration.constants';
import type { ByteCandidateSource, StickCandidate } from '../hid-calibration.type';

const travelOf = (lo: number | undefined, hi: number | undefined): number => {
  if (lo === undefined) return 0;
  if (hi === undefined) return Number.NaN;
  return hi - lo;
};

const byteCandidate = ({ idx, mins, maxs, baseline, bytes, fallbackCenter }: ByteCandidateSource): StickCandidate => ({
  idx,
  range: travelOf(mins[idx], maxs[idx]),
  min: mins[idx] ?? 0,
  max: maxs[idx] ?? BYTE_MAX,
  center: baseline[idx] ?? bytes[idx] ?? fallbackCenter,
});

export { byteCandidate };
