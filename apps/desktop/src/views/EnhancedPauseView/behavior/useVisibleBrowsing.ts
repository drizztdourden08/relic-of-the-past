/* @layer renderer-hud @kind hook */
import { useRef } from 'react';
import type { PauseState } from '@rotp/game-data';
import { FIRST_CELL } from '../EnhancedPauseView.constants';
import type { BrowsingView } from '../EnhancedPauseView.type';

const useVisibleBrowsing = (state: PauseState, canConfirm: boolean): BrowsingView => {
  const seen = useRef<BrowsingView>(FIRST_CELL);

  if (state.phase === 'browsing') {
    seen.current = { screen: state.screen, section: state.section, cursor: state.cursor, canConfirm };
  }

  return seen.current;
};

export { useVisibleBrowsing };
