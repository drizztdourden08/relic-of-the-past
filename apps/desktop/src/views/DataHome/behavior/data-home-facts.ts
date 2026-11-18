/* @layer renderer-components @kind logic */
import { formatBytes } from '@drizztdourden08/brock-core';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { StorageSummary } from '@drizztdourden08/brock-core';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';

const countOf = (summary: StorageSummary | null, domain: string): string => {
  const usage = summary?.domains.find((entry) => entry.domain === domain);
  return usage === undefined ? '...' : String(usage.count);
};

const dataHomeFacts = (summary: StorageSummary | null, t: I18n['t']): FactsPanelGroup[] => [[
  { label: t('views-data-home:facts.disk'), value: summary === null ? '...' : formatBytes(summary.totalBytes), mono: true },
  { label: t('views-data-home:facts.profiles'), value: countOf(summary, 'profiles'), mono: true },
  { label: t('views-data-home:facts.roms'), value: countOf(summary, 'roms'), mono: true },
]];

export { dataHomeFacts };
