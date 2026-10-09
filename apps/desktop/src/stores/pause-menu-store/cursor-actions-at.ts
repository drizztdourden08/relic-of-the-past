/* @layer renderer-stores @kind logic */
import type { PauseContext, PauseState } from '@rotp/game-data';
import { assignTargetAt, confirmVerbAt, firstSectionOf } from '@rotp/game-data';
import type { PauseCursorActions } from './pause-menu-store.type';

const cursorActionsAt = (state: PauseState, ctx: PauseContext): PauseCursorActions => ({
  confirm: confirmVerbAt(state, ctx),
  assign: assignTargetAt(state, ctx) !== null,
  back: state.phase === 'browsing' && state.section !== firstSectionOf(state.screen),
});

export { cursorActionsAt };
