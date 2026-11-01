/* @layer website-site @kind logic */
import type { TimelineEntry } from './timeline-entry.type';

const sectionIdsOf = (entries: readonly TimelineEntry[]): string[] =>
  entries.flatMap((entry) => [entry.id, ...(entry.children ?? []).map((child) => child.id)]);

export { sectionIdsOf };
