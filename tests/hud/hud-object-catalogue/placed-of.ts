/* @layer test @kind helper */
import { layoutHud } from '@shared/hud/engine';
import type { HudContainer, HudLayout, HudNode } from '@shared/types/hud';
import { row } from './row';

const view = { w: 400, h: 200 };

const docOf = (root: HudContainer): HudLayout => ({
  id: 'test',
  name: 'Test',
  builtIn: false,
  screen: {
    kind: 'container',
    id: 'screen',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
    justifyItems: 'start',
    alignItems: 'start',
    children: [{ ...root, place: { column: 1, row: 1 } }],
  },
});

const placedOf = (root: HudNode, scope: Record<string, number>) =>
  layoutHud(docOf(row([root])), view, { scope });

export { placedOf };
