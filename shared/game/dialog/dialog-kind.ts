/* @layer shared-game @kind logic */
/**
 * Which kind of message the engine is showing, from the snapshot's flags and the frame position it
 * chose. The death and select menus are the one case the position tells apart: they force their
 * own top-left instead of taking one of the two gameplay slots.
 */
import type { DialogKind } from './dialog-frame.types';

/** RenderText_PostDeathSaveOptions forces this top-left; DisplaySelectMenu shares the engine. */
const MENU_TOPLEFT = 0x61e8;

const kindOf = (bordered: boolean, story: boolean, topleft: number): DialogKind => {
  if (story) return 'story';
  if (topleft === MENU_TOPLEFT) return 'menu';
  return bordered ? 'box' : 'floating';
};

export { kindOf, MENU_TOPLEFT };
