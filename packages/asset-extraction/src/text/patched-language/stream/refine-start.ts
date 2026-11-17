/* @layer shared-asset-extraction @kind logic */
import { scanSegment } from './scan-segment';
import { segmentMatches } from './segment-matches';
import { BANK_BYTES, PADDING_BYTES, PADDING_RUN } from './stream.constants';
import type { SegmentResult, SegmentScan, SegmentWant } from './stream.type';

const followsPadding = (bytes: Uint8Array, at: number): boolean => {
  if (at < PADDING_RUN) return false;
  const pad = bytes[at - 1] ?? -1;
  if (!PADDING_BYTES.includes(pad)) return false;
  for (let i = 2; i <= PADDING_RUN; i += 1) {
    if (bytes[at - i] !== pad) return false;
  }
  return true;
};

const isLikelyStart = (bytes: Uint8Array, at: number): boolean =>
  at % BANK_BYTES === 0 || followsPadding(bytes, at);

const refineStart = (scan: SegmentScan, start: number, found: SegmentResult, want: SegmentWant): number => {
  const last = found.firstEnd < 0 ? start : found.firstEnd;
  for (let at = start; at <= last; at += 1) {
    if (!isLikelyStart(scan.bytes, at)) continue;
    if (segmentMatches(scanSegment(scan, at), want)) return at;
  }
  return start;
};

export { refineStart };
