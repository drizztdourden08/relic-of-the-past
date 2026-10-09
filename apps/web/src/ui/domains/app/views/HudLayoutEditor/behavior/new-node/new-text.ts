/* @layer renderer-components @kind logic */
import { newElement } from './new-element';
import type { HudElement } from '@shared/types/hud';

const newText = (): HudElement => newElement({
  type: 'text', value: 'Text', face: { from: 'font', family: 'sans', size: 16 },
});

export { newText };
