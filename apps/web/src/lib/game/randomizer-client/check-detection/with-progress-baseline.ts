/* @layer bridge-wasm @kind logic */
import { EMPTY_RUNG, EMPTY_RUNG_FLAG_OF_TIER_BYTE } from './check-detection.constants';
import type { CheckDetection } from './check-detection.type';

const withProgressBaseline = (detection: CheckDetection | null, startRung: number | undefined): CheckDetection | null => {
  if (detection === null || startRung === undefined) return detection;
  if (detection.mode !== 'progress' || detection.compare === undefined) return detection;
  if (startRung === EMPTY_RUNG) {
    const flagIndex = EMPTY_RUNG_FLAG_OF_TIER_BYTE.get(detection.bufferIndex);
    return flagIndex === undefined ? detection : { mode: 'progress', bufferIndex: flagIndex, compare: 'eq', value: 0 };
  }
  const nativeLevelOfStartRung = startRung - 1;
  if (nativeLevelOfStartRung === 0) return detection;
  const { value } = detection;
  if (typeof value === 'number') return { ...detection, value: value + nativeLevelOfStartRung };
  if (Array.isArray(value)) return { ...detection, value: value.map((v) => v + nativeLevelOfStartRung) };
  return detection;
};

export { withProgressBaseline };
