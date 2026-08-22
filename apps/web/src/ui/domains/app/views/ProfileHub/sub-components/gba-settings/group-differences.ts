/* @layer renderer-components @kind logic */
/** Filters and groups the GBA difference catalogue for the settings list — pure data
  * shaping, no rendering. Groups are emitted in the order declared by GbaGroup so the
  * list reads the same every time regardless of which rows survive the filter. */
import { GBA_DIFFERENCES } from '@shared/features/gba-differences.data';
import type { GbaDifference, GbaGroup } from '@shared/features/gba-difference.type';

type EvidenceFilter = 'all' | 'extracted';

interface GbaGroupRows {
  group: GbaGroup;
  rows: GbaDifference[];
}

const GBA_GROUP_ORDER: GbaGroup[] = [
  'Extra content',
  'Combat & items',
  'World & exploration',
  'Enemies & bosses',
  'Presentation',
  'Audio & voice',
  'Text & naming',
  'Save & meta',
  'Fixes',
  'Removed',
];

const matchesQuery = (row: GbaDifference, query: string): boolean =>
  row.label.toLowerCase().includes(query) || row.detail.toLowerCase().includes(query);

const groupFilteredDifferences = (query: string, evidenceFilter: EvidenceFilter): GbaGroupRows[] => {
  const q = query.trim().toLowerCase();
  const filtered = GBA_DIFFERENCES.filter((row) => {
    if (evidenceFilter === 'extracted' && row.evidence !== 'extracted') return false;
    return !q || matchesQuery(row, q);
  });

  return GBA_GROUP_ORDER
    .map((group) => ({ group, rows: filtered.filter((row) => row.group === group) }))
    .filter((entry) => entry.rows.length > 0);
};

export { GBA_GROUP_ORDER, groupFilteredDifferences };
export type { EvidenceFilter, GbaGroupRows };
