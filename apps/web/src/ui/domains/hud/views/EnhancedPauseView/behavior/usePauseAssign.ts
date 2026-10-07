/* @layer renderer-hud @kind hook */
/**
 * The mouse's way of putting the thing under the cursor onto a button, and the
 * one line of the menu that explains what a button press would do here.
 *
 * The assign half does no deciding: a click dispatches the same `slot` event the
 * input router raises for a pad press, so both go through `planAssignment` and
 * get the same answer (the same refusal on an unowned cell, the same duplicate
 * cleared). Owning that rule here as well is what made the two disagree in the
 * first place.
 *
 * What IS this hook's own is the WORDING, and how long a refusal stays up. The
 * store only counts that one happened; the flash is a view concern, and it has
 * to clear itself or it becomes a permanent label. The standing line is per
 * section because the invitation is: the item grid, the blade ladder and the
 * passive row each accept a press and each put a different thing on the button,
 * while the guard and armour ladders accept none.
 *
 * The hint is WRAPPED here, next to the words it wraps, and handed down as
 * lines. Every screen draws it centred in the same 96-pixel portrait column, and
 * a centred line wider than its column grows in both directions, so the longest
 * of these ran back across the panel beside it and out the far side. It folds
 * through the same `wrapName` the item names use, so a translated string is
 * reduced to drawable characters on the way, and a screen keeps drawing a hint
 * without knowing how many lines it turned out to be.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import { wrapName } from '../../PauseMenuView/behavior/wrap-name';
import {
  ASSIGN_ACTION_HINT, ASSIGN_BLADE_HINT, ASSIGN_HINT, GEAR_HINT, HINT_COLUMNS, REFUSE_HINT,
  REFUSE_MS,
} from '../EnhancedPauseView.constants';
import type { PauseScreen, PauseSection } from '@shared/game/logic/pause';
import type { SlotIndex } from '@shared/types/controls/scheme';

interface PauseAssign {
  /** Assign whatever the cursor holds to this slot. */
  assign: (slot: SlotIndex) => void;
  /** The line under the panel, already wrapped to the portrait column. */
  hintLines: readonly string[];
}

/** What a slot press would do on each gear row. Nothing, on the two ladders. */
const GEAR_HINTS: Partial<Record<PauseSection, string>> = {
  sword: ASSIGN_BLADE_HINT,
  passive: ASSIGN_ACTION_HINT,
};

const standingHint = (screen: PauseScreen, section: PauseSection): string => {
  if (screen === 'items') return ASSIGN_HINT;
  if (screen === 'gear') return GEAR_HINTS[section] ?? GEAR_HINT;
  return '';
};

/**
 * Enough rows for the longest line to break onto, plus one: `wrapName` keeps
 * whatever is left on its final row instead of truncating, so a row budget
 * that is too small reproduces the overflow instead of fixing it.
 */
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
export type { PauseAssign };
