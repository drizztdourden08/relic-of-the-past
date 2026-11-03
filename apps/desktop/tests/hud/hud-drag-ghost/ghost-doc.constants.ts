/* @layer tests @kind constants */
import type { HudLayout } from '@rotp/hud';
import { HEARTS_HUD, layoutOf, leaf } from '../layout-doc';

const DOC: HudLayout = layoutOf({
  id: 'screen',
  kind: 'container',
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  children: [
    HEARTS_HUD,
    {
      id: 'badge',
      kind: 'container',
      layout: 'grid',
      columns: ['auto', 'auto', 'auto'],
      rows: ['auto', 'auto'],
      children: [
        { ...leaf('life_pip'), place: { column: 1, row: 1 } },
        { ...leaf('coin'), place: { column: 2, row: 2 } },
      ],
    },
    {
      id: 'overlay',
      kind: 'container',
      layout: 'grid',
      columns: ['auto'],
      children: [
        { ...leaf('glyph'), place: { column: 1, row: 1 } },
        { ...leaf('item'), place: { column: 1, row: 1 } },
      ],
    },
    {
      id: 'rep',
      kind: 'element',
      element: {
        type: 'repeat',
        count: 8,
        child: { id: 'heart', kind: 'container', direction: 'row', children: [leaf('fill-sprite')] },
      },
    },
  ],
});

export { DOC };
