/* @layer shared-game @kind constants */
import type { DialogPrompt } from './dialog-prompts.type';

const TYPING_RENDER_STATE = 3;
const INSTANT_SPEED = 0;

const CHOOSE_VERTICAL: DialogPrompt = { buttons: ['up', 'down'], action: 'choose' };
const CHOOSE_ITEM: DialogPrompt = { buttons: ['left', 'right'], action: 'choose' };
const CONFIRM: DialogPrompt = { buttons: ['a'], action: 'confirm' };

export { CHOOSE_ITEM, CHOOSE_VERTICAL, CONFIRM, INSTANT_SPEED, TYPING_RENDER_STATE };
