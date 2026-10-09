/* @layer renderer-components @kind logic */
import { newElement } from './new-element';
import { placeholderChild } from './placeholder-child';
import type { HudElement } from '@rotp/hud';

const newRepeat = (): HudElement => newElement({ type: 'repeat', count: 1, child: placeholderChild() });

export { newRepeat };
