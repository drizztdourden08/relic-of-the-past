/* @layer tests @kind constants */
import type { HudLayout } from '@rotp/hud';
import { layoutOf, leaf } from '../layout-doc';

const DOC: HudLayout = layoutOf({
  id: 'screen',
  kind: 'container',
  direction: 'column',
  children: [
    leaf('a'), leaf('b'), leaf('c'), leaf('d'), leaf('e'), leaf('f'),
    { id: 'vault', kind: 'container', direction: 'row', children: [leaf('coin'), leaf('gem')] },
  ],
});

const ROW = 22;

const VIEW = { top: 0, bottom: 200, left: 0, right: 200 };

export { DOC, ROW, VIEW };
