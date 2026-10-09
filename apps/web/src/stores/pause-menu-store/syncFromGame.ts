/* @layer renderer-stores @kind logic */
import type { GameUIState } from '@shared/game/types';
import { reassertActiveItem, reconcileHostMenu } from '@app/lib/game/host-menu';
import { usePauseMenuStore } from './usePauseMenuStore';
import { refreshCursorActions } from './refreshCursorActions';
import { setMenuRouting } from './setMenuRouting';

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
