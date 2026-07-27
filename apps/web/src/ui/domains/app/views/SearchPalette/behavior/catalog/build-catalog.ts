/* @layer renderer-components @kind logic */
/** Merges every SearchSource into one flat catalog. Adding a searchable domain later
 *  (game checks, items) means adding one file here — the engine never changes. */
import type { SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';
import { menuSource } from './menu-source';
import { settingsSource } from './settings-source';
import { tabSource } from './tab-source';
import { actionSource } from './action-source';

const SOURCES: SearchSource[] = [menuSource, settingsSource, tabSource, actionSource];

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

export { buildCatalog, SOURCES };
