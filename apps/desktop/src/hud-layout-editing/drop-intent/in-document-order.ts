/* @layer renderer-components @kind logic */
import { walkNodes } from '../node-edits';
import type { HudLayout } from '@rotp/hud';

const inDocumentOrder = (doc: HudLayout, ids: readonly string[]): string[] => {
  const wanted = new Set(ids);
  return walkNodes(doc).filter((site) => wanted.has(site.node.id)).map((site) => site.node.id);
};

export { inDocumentOrder };
