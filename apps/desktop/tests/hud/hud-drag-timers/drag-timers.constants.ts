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
      leaf('a'), leaf('b'), leaf('c'), leaf('d'), leaf('e'), leaf('f'),
      { id: 'vault', kind: 'container', direction: 'row', children: [leaf('coin'), leaf('gem')] },
    ],
  },
};

const ROW = 22;

const VIEW = { top: 0, bottom: 200, left: 0, right: 200 };

export { DOC, ROW, VIEW };
