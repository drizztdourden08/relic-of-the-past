/* @layer shared-asset-extraction @kind logic */
import { collectSegments } from './collect-segments';
import { remainingCounts } from './remaining-counts';
import { scanSegment } from './scan-segment';
import type { SecondSegment, StreamSearch } from './stream.type';

const pairSecondSegment = (search: StreamSearch, before: number, baseStart: number | null): SecondSegment | null => {
  const counts = remainingCounts(before);
  if (baseStart !== null) {
    const atBase = scanSegment(search.scan, baseStart);
    if (atBase.end === 'finish' && counts.includes(atBase.count)) return { start: baseStart, moved: false };
  }
  const want = { end: 'finish' as const, counts, before, hints: search.hints };
  const found = collectSegments(search.scan, want, 1)[0];
  return found ? { start: found.start, moved: true } : null;
};

export { pairSecondSegment };
