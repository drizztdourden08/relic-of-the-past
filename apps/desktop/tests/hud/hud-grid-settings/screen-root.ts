/* @layer tests @kind helper */
import type { HudGridContainer, HudNode } from '@rotp/hud';

const leaf = (id: string, place: Record<string, number>): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, place }) as unknown as HudNode;

const screenRoot = (gap?: HudGridContainer['gap']): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  guide: { show: true, color: '#c064c0' },
  ...(gap ? { gap } : {}),
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

export { screenRoot };
