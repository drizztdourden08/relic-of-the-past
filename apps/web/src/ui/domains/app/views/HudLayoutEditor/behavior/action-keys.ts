/* @layer renderer-components @kind logic */
/**
 * A PRESS IS LOOKED UP BY THE CAP THE LEGEND DRAWS (§58). Both manipulation
 * components use this, because both draw the same legend off the same kind
 * of table.
 *
 * The pressed key is turned into the very label that goes on the `KeyCap` (`←`, `Del`,
 * `Esc`) and matched against the action rows, so "the shortcut does what the
 * legend says" is not a convention anybody has to maintain: it IS the lookup.
 */
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { EditorAction } from '../sub-components/SelectionBands';

const ARROW_GLYPH: Readonly<Record<string, string>> = {
  ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
};

const capOf = (event: ReactKeyboardEvent): string | null => {
  const arrow = ARROW_GLYPH[event.key];
  if (arrow) return arrow;
  if (event.key === 'Delete' || event.key === 'Backspace') return 'Del';
  return null;
};

/** A row claims a press when its caps are exactly that one key. A four-arrow
 *  cursor row names four caps and so claims none of them. */
const runnerFor = (actions: readonly EditorAction[], label: string): EditorAction | undefined =>
  actions.find((action) => action.run !== undefined
    && action.shortcut?.mouse === undefined
    && action.shortcut?.keys?.length === 1
    && action.shortcut.keys[0] === label);

export { ARROW_GLYPH, capOf, runnerFor };
