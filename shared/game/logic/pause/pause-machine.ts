/* @layer shared-game @kind logic */
import type { PauseContext, PauseEvent, PauseState } from './pause.type';
import { openScreen } from './open-screen';
import { reduceBrowsing } from './reduce-browsing';

const reducePause = (state: PauseState, event: PauseEvent, ctx: PauseContext): PauseState => {
  if (event.type === 'opened') return openScreen('items', ctx);
  if (event.type === 'closed') return { phase: 'closed' };
  if (state.phase !== 'browsing') return state;
  return reduceBrowsing(state, event, ctx);
};

export { reducePause };
export type { AssignTarget, PauseContext, PauseEvent, PauseScreen, PauseSection, PauseState } from './pause.type';
