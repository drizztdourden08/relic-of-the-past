/* @layer renderer-hud @kind hook */
/**
 * The mouse's half of the menu: land the cursor somewhere, jump to a screen,
 * fire what it landed on.
 *
 * Every one of them is a `PauseEvent` like any other. A click means something a
 * directional event cannot say ("the cursor is now HERE"), so the machine has a
 * `focus` event for it instead of this hook faking a run of moves or writing the
 * state itself; `focus` still lands through `clampCursor`, so a click cannot
 * reach a cell a d-pad could not.
 *
 * A tab is the one click that is not a landing at all. It changes SCREEN, and a
 * screen entered opens where that screen opens (on the worn blade, not on the
 * "no blade" rung below it), so it raises the machine's own screen verb instead
 * of a focus on cell zero. Sending cell zero is what let a click on the GEAR
 * tab arm a confirm that would have unequipped the sword.
 *
 * What a click DOES once it has landed is not this hook's business, and used not
 * to be a `PauseEvent` at all: a gear tier called the bridge from the view and
 * save-and-quit had an event only the mouse ever raised. Both are now `confirm`,
 * so the pointer takes the pad's path (focus, then confirm), and the rule for
 * what a confirm means is asked in exactly one place.
 */
import { useMemo } from 'react';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import type { PauseEvent, PauseScreen, PauseSection } from '@shared/game/logic/pause';

interface PauseCursor {
  /** Put the cursor on a cell of the screen already showing. */
  focus: (screen: PauseScreen, section: PauseSection, cursor: number) => void;
  /** Jump straight to a screen, landing where that screen opens. */
  selectScreen: (screen: PauseScreen) => void;
  /** Fire whatever the cursor is on. This is the pad's confirm, from a pointer. */
  confirm: () => void;
}

const usePauseCursor = (): PauseCursor => useMemo(() => {
  const dispatch = (event: PauseEvent): void => usePauseMenuStore.getState().dispatch(event);

  return {
    focus: (screen, section, cursor) => dispatch({ type: 'focus', screen, section, cursor }),
    selectScreen: (screen) => dispatch({ type: 'screen', screen }),
    confirm: () => dispatch({ type: 'confirm' }),
  };
}, []);

export { usePauseCursor };
export type { PauseCursor };
