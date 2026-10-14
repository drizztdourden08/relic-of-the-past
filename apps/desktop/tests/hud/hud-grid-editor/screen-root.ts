/* @layer tests @kind helper */
import type { HudGridContainer, HudNode, HudPlace } from '@rotp/hud';

const leaf = (id: string, place?: HudPlace): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, ...(place ? { place } : {}) });

const screenRoot = (): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

export { screenRoot };
