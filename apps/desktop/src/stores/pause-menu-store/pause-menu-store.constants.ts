/* @layer renderer-stores @kind constants */
import type { PauseState } from '@rotp/game-data';
import type { PauseCursorActions } from './pause-menu-store.type';

const CLOSED: PauseState = { phase: 'closed' };

const NO_ACTIONS: PauseCursorActions = { confirm: null, assign: false, back: false };

const NATIVE_MENU_OPEN = 2;

export { CLOSED, NATIVE_MENU_OPEN, NO_ACTIONS };
