/* @layer shared-game @kind logic */
import type { BrowsingState, NavigationEvent, PauseContext, PauseState } from './pause.type';
import { clampCursor } from './clamp-cursor';
import { moveCursor } from './move-cursor';
import { openScreen } from './open-screen';
import { stepScreen } from './step-screen';

const reduceNavigation = (state: BrowsingState, event: NavigationEvent, ctx: PauseContext): PauseState => {
  switch (event.type) {
    case 'move': {
      const next = moveCursor(state, event.dir, ctx);
      return { phase: 'browsing', screen: state.screen, section: next.section, cursor: next.cursor };
    }
    case 'prevScreen':
      return openScreen(stepScreen(state.screen, 'prev'), ctx);
    case 'nextScreen':
      return openScreen(stepScreen(state.screen, 'next'), ctx);
    case 'screen':
      return openScreen(event.screen, ctx);
    case 'focus': {
      const at = clampCursor(event.screen, { section: event.section, cursor: event.cursor }, ctx);
      return { phase: 'browsing', screen: event.screen, section: at.section, cursor: at.cursor };
    }
  }
};

export { reduceNavigation };
