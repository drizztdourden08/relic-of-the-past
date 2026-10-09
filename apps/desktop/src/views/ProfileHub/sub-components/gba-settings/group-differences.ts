/* @layer renderer-components @kind logic */
import { GBA_DIFFERENCES } from '@rotp/features';
import type { GbaDifference } from '@rotp/features';
import { GBA_GROUP_ORDER } from './gba-settings.constants';
import type { EvidenceFilter, GbaGroupRows } from './gba-settings.type';

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

export { groupFilteredDifferences };
export type { EvidenceFilter, GbaGroupRows };
