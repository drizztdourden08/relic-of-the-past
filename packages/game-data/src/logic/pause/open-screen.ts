/* @layer shared-game @kind logic */
import type { PauseContext, PauseScreen, PauseState } from './pause.type';
import { openingCursor } from './opening-cursor';

const openScreen = (screen: PauseScreen, ctx: PauseContext): PauseState => {
  const at = openingCursor(screen, ctx);
  return { phase: 'browsing', screen, section: at.section, cursor: at.cursor };
};

export { openScreen };
