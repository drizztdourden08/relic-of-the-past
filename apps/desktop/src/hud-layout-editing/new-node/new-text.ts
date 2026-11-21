/* @layer renderer-components @kind logic */
import { newElement } from './new-element';
import type { HudElement } from '@rotp/hud';

const newText = (value: string): HudElement => newElement({
  type: 'text', value, face: { from: 'font', family: 'sans', size: 16 },
});

export { newText };
