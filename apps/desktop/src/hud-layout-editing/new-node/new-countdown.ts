/* @layer renderer-components @kind logic */
import { newElement } from './new-element';
import type { HudElement } from '@rotp/hud';

const newCountdown = (): HudElement => newElement({ type: 'countdown' });

export { newCountdown };
