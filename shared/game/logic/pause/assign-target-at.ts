/* @layer shared-game @kind logic */
import type { AssignTarget, PauseContext, PauseState } from './pause.type';
import { clampCursor } from './clamp-cursor';
import { hudItemAt } from './hud-item-at';

const assignTargetAt = (state: PauseState, ctx: PauseContext): AssignTarget | null => {
  if (state.phase !== 'browsing') return null;
  if (state.screen === 'items') {
    if (state.section !== 'items' && state.section !== 'bottles') return null;
    const at = clampCursor('items', { section: state.section, cursor: state.cursor }, ctx);
    if (at.section !== 'items' && at.section !== 'bottles') return null;
    const hudItem = hudItemAt(at.section, at.cursor);
    return hudItem === null ? null : { kind: 'item', hudItem };
  }
  if (state.screen !== 'gear') return null;
  if (state.section === 'sword') return { kind: 'sword' };
  return state.section === 'passive' ? { kind: 'action' } : null;
};

export { assignTargetAt };
