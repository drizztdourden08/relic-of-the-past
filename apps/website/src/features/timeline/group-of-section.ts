/* @layer website-site @kind logic */
import type { TimelineEntry } from './timeline-entry.type';

const groupOfSection = (entries: readonly TimelineEntry[], sectionId: string | null): string | null =>
  entries.find((entry) => entry.id === sectionId || entry.children?.some((child) => child.id === sectionId))?.id ?? null;

export { groupOfSection };
