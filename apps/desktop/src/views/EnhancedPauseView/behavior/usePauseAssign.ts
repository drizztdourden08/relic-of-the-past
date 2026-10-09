/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import { wrapName } from '../../PauseMenuView/behavior/wrap-name';
import {
  ASSIGN_HINT, GEAR_HINT, GEAR_HINTS, HINT_COLUMNS, REFUSE_HINT, REFUSE_MS,
} from '../EnhancedPauseView.constants';
import type { PauseScreen, PauseSection } from '@rotp/game-data';
import type { SlotIndex } from '@rotp/game-data';
import type { PauseAssign } from '../EnhancedPauseView.type';

const standingHint = (screen: PauseScreen, section: PauseSection): string => {
  if (screen === 'items') return ASSIGN_HINT;
  if (screen === 'gear') return GEAR_HINTS[section] ?? GEAR_HINT;
  return '';
};

const wrapHint = (text: string): readonly string[] =>
  (text ? wrapName(text, { maxCols: HINT_COLUMNS, maxLines: Math.ceil(text.length / HINT_COLUMNS) + 1 }) : []);

const usePauseAssign = (screen: PauseScreen, section: PauseSection): PauseAssign => {
  const refusals = usePauseMenuStore((s) => s.refusals);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (refusals === 0) return;
    setFlashing(true);
    const timer = setTimeout(() => setFlashing(false), REFUSE_MS);
    return () => clearTimeout(timer);
  }, [refusals]);

  const assign = useCallback((slot: SlotIndex) => {
    usePauseMenuStore.getState().dispatch({ type: 'slot', slot });
  }, []);

  const hintLines = useMemo(
    () => wrapHint(flashing ? REFUSE_HINT : standingHint(screen, section)),
    [flashing, screen, section],
  );

  return { assign, hintLines };
};

export { usePauseAssign };
