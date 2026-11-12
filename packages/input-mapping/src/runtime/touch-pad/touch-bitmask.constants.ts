/* @layer shared-input @kind constants */
import type { SnesButton } from '@rotp/game-data';
import { TOUCH_PAD_KEY } from '../../touch/touch-emit.constants';

const EMPTY_KEYS = new Map<string, boolean>();
const EMPTY_KEYBOARD = new Map<string, SnesButton>();
const TOUCH_ALLOWED = { keyboard: false, gamepadKeys: new Set([TOUCH_PAD_KEY]) };

export { EMPTY_KEYBOARD, EMPTY_KEYS, TOUCH_ALLOWED };
