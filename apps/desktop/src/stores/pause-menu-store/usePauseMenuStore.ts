/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { reducePause } from '@shared/game/logic/pause';
import type { PauseMenuStore } from './pause-menu-store.type';
import { CLOSED, NO_ACTIONS } from './pause-menu-store.constants';
import { pauseContext } from './pause-context';
import { cursorActionsAt } from './cursor-actions-at';
import { assignFromCursor } from './assign-from-cursor';
import { performConfirm } from './perform-confirm';
import { performExit } from './perform-exit';

const usePauseMenuStore = create<PauseMenuStore>()((set, get) => ({
  state: CLOSED,
  open: false,
  refusals: 0,
  canConfirm: false,
  cursorActions: NO_ACTIONS,
  dispatch: (event) => {
    const ctx = pauseContext();
    const prev = get().state;
    if (event.type === 'slot') {
      if (assignFromCursor(prev, event.slot, ctx)) set({ refusals: get().refusals + 1 });
      return;
    }
    if (event.type === 'confirm' && !performConfirm(prev, ctx)) {
      set({ refusals: get().refusals + 1 });
      return;
    }
    const next = reducePause(prev, event, ctx);
    if (next === prev) return;
    if (!performExit(prev, next)) return;
    const actions = next.phase === 'browsing' ? cursorActionsAt(next, ctx) : get().cursorActions;
    set({
      state: next,
      open: next.phase !== 'closed',
      cursorActions: actions,
      canConfirm: actions.confirm !== null,
      ...(event.type === 'opened' ? { refusals: 0 } : {}),
    });
  },
}));

export { usePauseMenuStore };
