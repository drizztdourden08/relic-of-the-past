/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import type { PauseEvent } from '@shared/game/logic/pause';
import type { PauseCursor } from '../EnhancedPauseView.type';

const usePauseCursor = (): PauseCursor => useMemo(() => {
  const dispatch = (event: PauseEvent): void => usePauseMenuStore.getState().dispatch(event);

  return {
    focus: (screen, section, cursor) => dispatch({ type: 'focus', screen, section, cursor }),
    selectScreen: (screen) => dispatch({ type: 'screen', screen }),
    confirm: () => dispatch({ type: 'confirm' }),
  };
}, []);

export { usePauseCursor };
