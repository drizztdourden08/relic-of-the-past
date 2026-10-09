/* @layer renderer-stores @kind logic */
import type { GameUIState } from '@rotp/game-data';
import { reassertActiveItem, reconcileHostMenu } from '@rotp/game-core';
import { usePauseMenuStore } from './usePauseMenuStore';
import { refreshCursorActions } from './refresh-cursor-actions';
import { setMenuRouting } from './set-menu-routing';

const syncFromGame = (ui: GameUIState): void => {
  reconcileHostMenu(ui.hostMenu);
  refreshCursorActions();
  const shouldBeOpen = ui.hostMenu.holding && ui.mode === 'paused_menu';
  const { open, dispatch } = usePauseMenuStore.getState();
  if (shouldBeOpen === open) return;
  reassertActiveItem();
  setMenuRouting(shouldBeOpen);
  dispatch({ type: shouldBeOpen ? 'opened' : 'closed' });
};

export { syncFromGame };
