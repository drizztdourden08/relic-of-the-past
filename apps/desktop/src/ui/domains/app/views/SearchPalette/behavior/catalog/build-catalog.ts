/* @layer renderer-components @kind logic */
import type { SearchContext, SearchEntry } from '../../SearchPalette.type';
import { SOURCES } from './build-catalog.constants';

const buildCatalog = (ctx: SearchContext): SearchEntry[] => {
  const seen = new Set<string>();
  const catalog: SearchEntry[] = [];
  for (const source of SOURCES) {
    for (const entry of source.build(ctx)) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      catalog.push(entry);
    }
  }
  return catalog;
};

export { buildCatalog };
