/* @layer renderer-components @kind logic */
import { formatBytes } from '@drizztdourden08/brock-core';
import type { StorageSummary } from '@drizztdourden08/brock-core';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';

const countOf = (summary: StorageSummary | null, domain: string): string => {
  const usage = summary?.domains.find((entry) => entry.domain === domain);
  return usage === undefined ? '...' : String(usage.count);
};

const dataHomeFacts = (summary: StorageSummary | null): FactsPanelGroup[] => [[
  { label: 'On disk', value: summary === null ? '...' : formatBytes(summary.totalBytes), mono: true },
  { label: 'Profiles', value: countOf(summary, 'profiles'), mono: true },
  { label: 'ROMs', value: countOf(summary, 'roms'), mono: true },
]];

export { dataHomeFacts };
