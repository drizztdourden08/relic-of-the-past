/* @layer bridge-wasm @kind logic */
import type { CheckDetection } from '../check-detection';
import type { HeapReads } from './poll-heap-reads.type';

const thresholdMet = (val: number, compare: 'gte' | 'eq' | 'any-of', value: number | number[] | undefined): boolean => {
  if (compare === 'gte') return val >= (value as number);
  if (compare === 'eq') return val === (value as number);
  if (compare === 'any-of') return (value as number[]).includes(val);
  return false;
};

const isDetectionMet = (detection: CheckDetection, reads: HeapReads): boolean => {
  if (detection.mode === 'room-mask') return (reads.roomWord(detection.roomId) & detection.mask) !== 0;
  if (detection.mode === 'ow-mask') return (reads.owByte(detection.owScreen) & detection.mask) !== 0;
  if (detection.mask !== undefined) return (reads.progByte(detection.bufferIndex) & detection.mask) !== 0;
  if (detection.compare !== undefined) {
    return thresholdMet(reads.progByte(detection.bufferIndex), detection.compare, detection.value);
  }
  return false;
};

export { isDetectionMet };
