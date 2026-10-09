/* @layer tests @kind constants */
import type { Platform } from '../../../shared/platform';
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
      {
        id: 'hud',
        kind: 'container',
        direction: 'column',
        children: [
          { id: 'hearts', kind: 'container', direction: 'row', children: [leaf('pip1'), leaf('pip2')] },
          leaf('magic-bar'),
        ],
      },
      { id: 'vault', kind: 'container', direction: 'row', children: [leaf('coin')] },
      leaf('loose'),
    ],
  },
} as unknown as HudLayout;

export { DOC, PLATFORM };
