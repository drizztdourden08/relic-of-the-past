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
};

export { DOC };
