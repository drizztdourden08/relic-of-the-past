/* @layer renderer-components @kind logic */
import { newElement } from './new-element';
import type { HudElement } from '@shared/types/hud';

const newButton = (): HudElement => newElement({
  type: 'button',
  bind: { kind: 'slot', index: 1 },
  states: { idle: { from: 'glyph', pack: 'generic', glyph: 'DPAD' } },
});

export { newButton };
