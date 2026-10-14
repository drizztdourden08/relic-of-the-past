/* @layer tests @kind constants */
import type { HudElement, HudLayout } from '@rotp/hud';

const leaf = (id: string): HudElement => ({ id, kind: 'element', element: { type: 'spacer' } });

const DOC: HudLayout = {
  id: 'l',
  name: 'l',
  builtIn: false,
  screen: {
    id: 'screen',
    kind: 'container',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
    children: [
      {
        id: 'hud',
        kind: 'container',
        direction: 'column',
        children: [
          { id: 'hearts', kind: 'container', direction: 'row', children: [leaf('pip1'), leaf('pip2')] },
          leaf('magic-bar'),
        ],
      },
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
  },
};

export { DOC };
