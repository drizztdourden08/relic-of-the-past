/* @layer renderer-components @kind logic */
import { siteOf } from './node-edits';
import type { HudLayout } from '@shared/types/hud';

const insertSite = (doc: HudLayout, selectedId: string | null): { parentId: string; at?: number } => {
  const fallback = { parentId: doc.screen.id };
  if (!selectedId) return fallback;
  const site = siteOf(doc, selectedId);
  if (!site) return fallback;
  if (site.node.kind === 'container') return { parentId: site.node.id };
  return site.parent ? { parentId: site.parent.id, at: site.index + 1 } : fallback;
};

export { insertSite };
