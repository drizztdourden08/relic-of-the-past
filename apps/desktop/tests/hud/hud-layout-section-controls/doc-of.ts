/* @layer tests @kind helper */
import type { HudGridContainer, HudLayout } from '@rotp/hud';

const docOf = (root: HudGridContainer): HudLayout => ({
  id: 'phase7',
  name: 'Phase 7',
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

export { docOf };
