/* @layer renderer-stores @kind logic */
import { usePauseMenuStore } from './usePauseMenuStore';
import { pauseContext } from './pauseContext';
import { cursorActionsAt } from './cursorActionsAt';
import { sameActions } from './sameActions';

const refreshCursorActions = (): void => {
  const { state, cursorActions } = usePauseMenuStore.getState();
  if (state.phase !== 'browsing') return;
  const next = cursorActionsAt(state, pauseContext());
  if (sameActions(next, cursorActions)) return;
  usePauseMenuStore.setState({ cursorActions: next, canConfirm: next.confirm !== null });
};

export { refreshCursorActions };
