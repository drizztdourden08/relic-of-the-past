/* @layer tests @kind constants */
import type { HudLayout } from '@rotp/hud';
import { HEARTS_HUD, layoutOf, leaf } from '../layout-doc';

const DOC: HudLayout = layoutOf({
  id: 'screen',
  kind: 'container',
  direction: 'column',
  children: [
    HEARTS_HUD,
    { id: 'vault', kind: 'container', direction: 'row', children: [leaf('coin')] },
    leaf('loose'),
  ],
});

export { DOC };
