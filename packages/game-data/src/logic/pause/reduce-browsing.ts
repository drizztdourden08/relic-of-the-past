/* @layer shared-game @kind logic */
import type { BrowsingState, PauseContext, PauseEvent, PauseState } from './pause.type';
import { confirmTargetAt } from './confirm-target-at';
import { firstSectionOf } from './first-section-of';
import { isNavigationEvent } from './is-navigation-event';
import { openScreen } from './open-screen';
import { reduceNavigation } from './reduce-navigation';

const backOut = (state: BrowsingState, ctx: PauseContext): PauseState =>
  state.section === firstSectionOf(state.screen)
    ? { phase: 'closing', via: 'continue' }
    : openScreen(state.screen, ctx);

const reduceBrowsing = (
  state: BrowsingState,
  event: PauseEvent,
  ctx: PauseContext,
): PauseState => {
  if (isNavigationEvent(event)) return reduceNavigation(state, event, ctx);
  switch (event.type) {
    case 'cancel':
      return backOut(state, ctx);
    case 'pause':
      return { phase: 'closing', via: 'continue' };
    case 'confirm': {
      const target = confirmTargetAt(state, ctx);
      return target?.kind === 'exit' ? { phase: 'closing', via: target.via } : state;
    }
    case 'closed':
      return { phase: 'closed' };
    case 'slot':
    case 'opened':
      return state;
  }
};

export { reduceBrowsing };
