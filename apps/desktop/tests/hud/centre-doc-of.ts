/* @layer tests @kind helper */
import type { HudContainer, HudLayout } from '@rotp/hud';

const centreDocOf = (root: HudContainer, id: string, name: string): HudLayout => ({
  id,
  name,
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

export { centreDocOf };
