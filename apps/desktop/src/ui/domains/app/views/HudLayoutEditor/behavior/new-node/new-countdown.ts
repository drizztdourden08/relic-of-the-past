/* @layer renderer-components @kind logic */
import { newElement } from './new-element';
import type { HudElement } from '@shared/types/hud';

const newCountdown = (): HudElement => newElement({ type: 'countdown' });

export { newCountdown };
