/* @layer shared-asset-extraction @kind logic */
import { refineStart } from './refine-start';
import { scanSegment } from './scan-segment';
import { fewestWanted } from './fewest-wanted';
import { segmentMatches } from './segment-matches';
import { BANK_BYTES } from './stream.constants';
import type { FoundSegment, SegmentResult, SegmentScan, SegmentWant } from './stream.type';

const nextStart = (at: number, result: SegmentResult, want: SegmentWant): number => {
  const tooShort = result.end !== want.end || result.count < fewestWanted(want);
  if (result.end !== 'error' && tooShort) return result.stop + 1;
  return result.firstEnd < 0 ? at + 1 : result.firstEnd + 1;
};

const quickStarts = (scan: SegmentScan, hints: readonly number[]): number[] => {
  const banks = Array.from({ length: Math.ceil(scan.bytes.length / BANK_BYTES) }, (_, bank) => bank * BANK_BYTES);
  return [...new Set([...hints, ...banks])].filter((at) => at >= 0 && at < scan.bytes.length);
};

const collectSegments = (scan: SegmentScan, want: SegmentWant, limit: number): FoundSegment[] => {
  const found: FoundSegment[] = [];
  const keep = (start: number, result: SegmentResult): boolean => {
    const refined = refineStart(scan, start, result, want);
    if (!found.some((segment) => segment.start === refined)) found.push({ start: refined, count: result.count });
    return found.length >= limit;
  };

  for (const start of quickStarts(scan, want.hints)) {
    const result = scanSegment(scan, { start, before: want.before });
    if (segmentMatches(result, want) && keep(start, result)) return found;
  }

  let at = 0;
  while (at < scan.bytes.length && scan.budget.steps > 0) {
    const result = scanSegment(scan, { start: at, before: want.before });
    if (segmentMatches(result, want) && keep(at, result)) return found;
    at = nextStart(at, result, want);
  }
  return found;
};

export { collectSegments };
