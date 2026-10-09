/* @layer shared-game @kind logic */
import type { BrowsingState, PauseContext, PauseEvent, PauseState } from './pause.type';
import { clampCursor } from './clamp-cursor';
import { confirmTargetAt } from './confirm-target-at';
import { firstSectionOf } from './first-section-of';
import { moveCursor } from './move-cursor';
import { openScreen } from './open-screen';
import { stepScreen } from './step-screen';

const backOut = (state: BrowsingState, ctx: PauseContext): PauseState =>
  state.section === firstSectionOf(state.screen)
    ? { phase: 'closing', via: 'continue' }
    : openScreen(state.screen, ctx);

const reduceBrowsing = (
  state: BrowsingState,
  event: PauseEvent,
  ctx: PauseContext,
): PauseState => {
  switch (event.type) {
    case 'move': {
      const next = moveCursor(state.screen, state.section, state.cursor, event.dir, ctx);
      return { phase: 'browsing', screen: state.screen, section: next.section, cursor: next.cursor };
    }
    case 'prevScreen':
      return openScreen(stepScreen(state.screen, 'prev'), ctx);
    case 'nextScreen':
      return openScreen(stepScreen(state.screen, 'next'), ctx);
    case 'screen':
      return openScreen(event.screen, ctx);
    case 'cancel':
      return backOut(state, ctx);
    case 'pause':
      return { phase: 'closing', via: 'continue' };
    case 'confirm': {
      const target = confirmTargetAt(state, ctx);
      return target?.kind === 'exit' ? { phase: 'closing', via: target.via } : state;
    }
    case 'focus': {
      const at = clampCursor(event.screen, { section: event.section, cursor: event.cursor }, ctx);
      return { phase: 'browsing', screen: event.screen, section: at.section, cursor: at.cursor };
    }
    case 'closed':
      return { phase: 'closed' };
    case 'slot':
    default:
      return state;
  }
};

export { reduceBrowsing };
