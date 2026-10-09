/* @layer renderer-components @kind logic */
import { newElement } from './new-element';
import { placeholderChild } from './placeholder-child';
import type { HudElement } from '@rotp/hud';

const newSwitch = (): HudElement => newElement({
  type: 'switch', cases: [{ when: '1', node: placeholderChild() }],
});

export { newSwitch };
