/* @layer shared-asset-extraction @kind logic */
import { linearToSnes, snesToLinear } from '../../../rom/snes-address';
import { collectSegments } from './collect-segments';
import { pairSecondSegment } from './pair-second-segment';
import { remainingCounts } from './remaining-counts';
import { scanSegment } from './scan-segment';
import {
  EXPECTED_MESSAGE_COUNTS, MAX_SEGMENT_CANDIDATES, MIN_SEGMENT_MESSAGES, MOVED_FIRST, MOVED_SECOND,
} from './stream.constants';
import type { StreamPlan, StreamSearch } from './stream.type';

const planOf = (linear: readonly number[], moved: string[]): StreamPlan => ({ starts: linear.map(linearToSnes), moved });

const fromFirstAt = (search: StreamSearch, first: number, firstMoved: boolean): StreamPlan | null => {
  const head = scanSegment(search.scan, first);
  const moved = firstMoved ? [MOVED_FIRST] : [];
  if (head.end === 'finish' && EXPECTED_MESSAGE_COUNTS.includes(head.count)) return planOf([first], moved);
  if (head.end !== 'switch' || head.count < MIN_SEGMENT_MESSAGES) return null;
  const base = search.romAddrs[1];
  const second = pairSecondSegment(search, head.count, base === undefined ? null : snesToLinear(base));
  if (!second) return null;
  return planOf([first, second.start], second.moved ? [...moved, MOVED_SECOND] : moved);
};

const fromSecondAtBase = (search: StreamSearch): StreamPlan | null => {
  const base = search.romAddrs[1];
  if (base === undefined) return null;
  const tail = scanSegment(search.scan, snesToLinear(base));
  if (tail.end !== 'finish' || tail.count < MIN_SEGMENT_MESSAGES) return null;
  const want = { end: 'switch' as const, counts: remainingCounts(tail.count), before: 0, hints: search.hints };
  const head = collectSegments(search.scan, want, 1)[0];
  return head ? planOf([head.start, snesToLinear(base)], [MOVED_FIRST]) : null;
};

const fromSingleSearch = (search: StreamSearch): StreamPlan | null => {
  const want = { end: 'finish' as const, counts: EXPECTED_MESSAGE_COUNTS, before: 0, hints: search.hints };
  const only = collectSegments(search.scan, want, 1)[0];
  return only ? planOf([only.start], [MOVED_FIRST]) : null;
};

const fromPairSearch = (search: StreamSearch): StreamPlan | null => {
  const want = { end: 'switch' as const, counts: [], before: 0, hints: search.hints };
  for (const head of collectSegments(search.scan, want, MAX_SEGMENT_CANDIDATES)) {
    const plan = fromFirstAt(search, head.start, true);
    if (plan) return plan;
  }
  return null;
};

const resolveStream = (search: StreamSearch): StreamPlan | null => {
  const first = search.romAddrs[0];
  const atBase = first === undefined ? null : fromFirstAt(search, snesToLinear(first), false);
  return atBase ?? fromSecondAtBase(search) ?? fromSingleSearch(search) ?? fromPairSearch(search);
};

export { resolveStream };
