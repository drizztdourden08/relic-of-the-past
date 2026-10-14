/* @layer renderer-components @kind logic */
import type { MsuFileMetadata } from '@rotp/msu';
import type { FormatCount } from './file-panel.type';

const formatCounts = (metadata: MsuFileMetadata[]): FormatCount[] => {
  const counts = new Map<string, number>();
  for (const file of metadata) counts.set(file.ext, (counts.get(file.ext) ?? 0) + 1);
  return [...counts]
    .map(([ext, count]) => ({ ext, count }))
    .sort((a, b) => b.count - a.count || a.ext.localeCompare(b.ext));
};

export { formatCounts };
