/* @layer tests @kind helper */
import type { HudGridContainer, HudNode, HudPlace } from '@rotp/hud';
import { FIXTURE_COLOURS } from '../fixture-colours.constants';

const leaf = (id: string, place: HudPlace): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, place });

const screenRoot = (gap?: HudGridContainer['gap']): HudGridContainer => ({
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start', alignItems: 'start',
  guide: { show: true, color: FIXTURE_COLOURS.guideMagenta },
  ...(gap ? { gap } : {}),
  children: [leaf('vitals', { column: 1, row: 1 }), leaf('wallet', { column: 1, row: 3 })],
});

export { screenRoot };
