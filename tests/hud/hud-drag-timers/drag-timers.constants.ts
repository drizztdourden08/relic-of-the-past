/* @layer tests @kind constants */
import type { Platform } from '@drizztdourden08/brock-core';
import type { HudLayout, HudNode } from '../../../shared/types/hud';

const leaf = (id: string): HudNode => ({ id, kind: 'element', element: { type: 'spacer' } } as unknown as HudNode);

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const DOC = {
  id: 'l',
  name: 'l',
  screen: {
    id: 'screen',
    kind: 'container',
    direction: 'column',
    children: [
      leaf('a'), leaf('b'), leaf('c'), leaf('d'), leaf('e'), leaf('f'),
      { id: 'vault', kind: 'container', direction: 'row', children: [leaf('coin'), leaf('gem')] },
    ],
  },
} as unknown as HudLayout;

const ROW = 22;

const VIEW = { top: 0, bottom: 200, left: 0, right: 200 };

export { DOC, PLATFORM, ROW, VIEW };
