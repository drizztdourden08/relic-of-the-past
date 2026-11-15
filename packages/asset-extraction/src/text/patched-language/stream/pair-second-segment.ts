/* @layer shared-asset-extraction @kind logic */
import { collectSegments } from './collect-segments';
import { scanSegment } from './scan-segment';
import { EXPECTED_MESSAGE_COUNTS } from './stream.constants';
import type { StreamSearch } from './stream.type';

interface SecondSegment {
  start: number;
  moved: boolean;
}

const remainingCounts = (before: number): number[] =>
  EXPECTED_MESSAGE_COUNTS.map((total) => total - before).filter((count) => count > 0);

const pairSecondSegment = (search: StreamSearch, before: number, baseStart: number | null): SecondSegment | null => {
  const counts = remainingCounts(before);
  if (baseStart !== null) {
    const atBase = scanSegment(search.scan, { start: baseStart, before });
    if (atBase.end === 'finish' && counts.includes(atBase.count)) return { start: baseStart, moved: false };
  }
  const want = { end: 'finish' as const, counts, before, hints: search.hints };
  const found = collectSegments(search.scan, want, 1)[0];
  return found ? { start: found.start, moved: true } : null;
};

export { pairSecondSegment, remainingCounts };
export type { SecondSegment };
