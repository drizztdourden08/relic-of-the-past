/* @layer renderer-components @kind logic */
import { zoneIn } from './drop-intent';
import { siteOf } from './node-edits';
import type { DropZone } from './drop-intent';
import type { HudLayout } from '@shared/types/hud';

const rowUnder = (doc: HudLayout, x: number, y: number): { rowId: string; zone: DropZone } | null => {
  const under = document.elementFromPoint(x, y);
  const row = under instanceof Element ? under.closest('[data-outline-row]') : null;
  if (!(row instanceof HTMLElement) || row.dataset.outlineLocked !== undefined) return null;
  const rowId = row.dataset.outlineRow ?? '';
  const site = siteOf(doc, rowId);
  if (!site) return null;
  const box = row.getBoundingClientRect();
  const zone = zoneIn((y - box.top) / (box.height || 1), {
    isContainer: site.node.kind === 'container',
    hasSiblings: site.parent !== null,
  });
  return { rowId, zone };
};

export { rowUnder };
