/* @layer renderer-hud @kind hook */
/**
 * What the menu should DRAW, which is not the same question as what the machine
 * is DOING.
 *
 * The pause machine has one browsing state and it exists only while the menu is
 * being browsed. `closing` carries no screen, no section and no cursor. It is
 * the machine saying "we are leaving", and quite correctly it does not describe
 * a place. But the menu is still on screen for the whole 483ms slide out, so a
 * view that falls back to a default while that plays reaches for `items`, cell
 * zero, and the player watches the panel they were reading swap to the item grid
 * on its way off the top: the tab underline jumps back to ITEMS, the gear
 * ladders become the inventory, the name panel changes to whatever cell zero
 * holds, and the legend drops CONFIRM.
 *
 * So the view remembers the last place it was told about and keeps drawing that
 * until the layer is gone. The menu leaves looking like the menu the player was
 * in, which is the only thing the exit animation is for.
 *
 * The legend's CONFIRM rides along for the same reason: it is derived from where
 * the cursor stands, so it too collapses the moment the machine stops standing
 * anywhere, and the strip would lose a verb halfway out.
 */
import { useRef } from 'react';
import type { PauseScreen, PauseSection, PauseState } from '@shared/game/logic/pause';

interface BrowsingView {
  screen: PauseScreen;
  section: PauseSection;
  cursor: number;
  /** Whether a confirm here would do anything. This is the legend's own question. */
  canConfirm: boolean;
}

/** Where a menu that has never been browsed would open. */
const FIRST_CELL: BrowsingView = { screen: 'items', section: 'items', cursor: 0, canConfirm: false };

/**
 * The last browsed position, held across `closing`. Assigning during render is
 * safe here because the value is derived from this render's own state and the
 * write is idempotent. A repeated render with the same state writes the same
 * thing.
 */
const useVisibleBrowsing = (state: PauseState, canConfirm: boolean): BrowsingView => {
  const seen = useRef<BrowsingView>(FIRST_CELL);

  if (state.phase === 'browsing') {
    seen.current = { screen: state.screen, section: state.section, cursor: state.cursor, canConfirm };
  }

  return seen.current;
};

export { useVisibleBrowsing };
export type { BrowsingView };
