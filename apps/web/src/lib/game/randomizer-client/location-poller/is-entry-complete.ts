/* @layer bridge-wasm @kind logic */
import { isDetectionMet } from '../poll-heap-reads';
import type { HeapReads } from '../poll-heap-reads';
import type { PollEntry } from './location-poller.type';

const isEntryComplete = (entry: PollEntry, reads: HeapReads, completed: ReadonlySet<string>): boolean => {
  if (entry.baselineOnly === true) return entry.checkId !== undefined && completed.has(entry.checkId);
  if (entry.detection !== undefined) return isDetectionMet(entry.detection, reads);
  return entry.checkId !== undefined && completed.has(entry.checkId);
};

export { isEntryComplete };
