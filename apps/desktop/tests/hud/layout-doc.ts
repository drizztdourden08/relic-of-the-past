/* @layer tests @kind helper */
import type { HudElement, HudLayout, HudNode } from '@rotp/hud';

const leaf = (id: string): HudElement => ({ id, kind: 'element', element: { type: 'spacer' } });

const layoutOf = (screen: HudLayout['screen']): HudLayout => ({ id: 'l', name: 'l', builtIn: false, screen });

const HEARTS_HUD: HudNode = {
  id: 'hud',
  kind: 'container',
  direction: 'column',
  children: [
    { id: 'hearts', kind: 'container', direction: 'row', children: [leaf('pip1'), leaf('pip2')] },
    leaf('magic-bar'),
  ],
};

export { HEARTS_HUD, layoutOf, leaf };
