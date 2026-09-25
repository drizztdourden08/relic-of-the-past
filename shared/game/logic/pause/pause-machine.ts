/* @layer shared-game @kind logic */
/**
 * The pause menu's reducer. Pure state, no writes.
 *
 * The split matters: this decides where the cursor IS, never what the game
 * does about it. A confirm on a gear tier moves nothing but the selection; the
 * caller performs the write, because only the caller holds the bridge. A slot
 * press is the same story and then some. It returns the state untouched and
 * hands the question "what is the cursor pointing at?" to `assignTargetAt`, so
 * the view's hook has exactly one place to ask and no cursor arithmetic of its
 * own.
 *
 * Confirm is the same shape again, asked of `confirmTargetAt`: the ONE case
 * that is a real state change (a status row choosing a way out of the
 * game) becomes the `closing` phase here, and everything else the confirm can
 * mean is a write the store performs from the same answer. Two readers, one
 * rule; nobody re-derives "what is under the cursor" a second time.
 */
import { confirmTargetAt } from './confirm-rule';
import { hudItemAt } from './item-cells';
import { openingCursor } from './opening-cursor';
import { clampCursor, firstSectionOf, moveCursor, stepScreen } from './screens';
import type { SlotIndex } from '@shared/types/controls/scheme';

type PauseScreen = 'items' | 'gear' | 'status';
type PauseSection =
  | 'items' | 'bottles' | 'sword' | 'shield' | 'mail' | 'bow' | 'passive' | 'actions';

type PauseState =
  | { phase: 'closed' }
  | { phase: 'browsing'; screen: PauseScreen; section: PauseSection; cursor: number }
  | { phase: 'closing'; via: 'continue' | 'save-quit' };

type PauseEvent =
  | { type: 'opened' } | { type: 'closed' } | { type: 'pause' }
  | { type: 'move'; dir: 'up' | 'down' | 'left' | 'right' }
  | { type: 'confirm' } | { type: 'cancel' }
  | { type: 'prevScreen' } | { type: 'nextScreen' }
  | { type: 'slot'; slot: SlotIndex }
  // A pointer says where the cursor IS, which no directional event can express.
  // It still lands through `clampCursor`, so the rule that stops a d-pad walking
  // onto a cell that does not exist stops a click doing it too.
  | { type: 'focus'; screen: PauseScreen; section: PauseSection; cursor: number }
  // A jump straight to a screen, the tab strip's own verb. It is NOT a focus
  // with cursor zero: a screen entered lands where that screen opens, and a
  // click on the GEAR tab that landed on tier zero armed a confirm that would
  // have taken the blade off, exactly as the d-pad's screen step once did.
  | { type: 'screen'; screen: PauseScreen };

interface PauseContext {
  owned: readonly boolean[];      // 24 item cells
  bottles: readonly number[];     // 4
  /**
   * What is in force on each ladder. The three tier fields are the tier itself;
   * `bow` is the arrow TYPE the launcher register is standing on (0 plain, 1
   * silver) and `NO_ARROW_TYPE` when nothing is held, never the raw register,
   * because the ammunition half of that byte is not the menu's business. Absent means
   * the same as nothing held, so a context built before the arrow row existed
   * leaves it inert instead of guessing.
   */
  gear: { sword: number; shield: number; mail: number; bow?: number };
  ownedMax: { sword: number; shield: number; mail: number; bow?: number };
  /** Hud-item id the core currently has equipped, if known. The cell to open on. */
  activeItem?: number;
}

/** What the cursor is pointing at, in the shape a slot assignment takes. */
type AssignTarget =
  | { kind: 'item'; hudItem: number }
  | { kind: 'sword' }
  | { kind: 'action' };

/**
 * A screen entered lands where that screen OPENS, which is the equipped item, the worn
 * tier, or the first cell where nothing is in force. `opening-cursor.ts` holds the
 * rule; every door into a screen comes through here so none of them can drift.
 */
const openScreen = (screen: PauseScreen, ctx: PauseContext): PauseState => {
  const at = openingCursor(screen, ctx);
  return { phase: 'browsing', screen, section: at.section, cursor: at.cursor };
};

/** Backing out of a nested section returns to the screen's first section. */
const backOut = (state: Extract<PauseState, { phase: 'browsing' }>, ctx: PauseContext): PauseState =>
  state.section === firstSectionOf(state.screen)
    ? { phase: 'closing', via: 'continue' }
    : openScreen(state.screen, ctx);

const reduceBrowsing = (
  state: Extract<PauseState, { phase: 'browsing' }>,
  event: PauseEvent,
  ctx: PauseContext,
): PauseState => {
  switch (event.type) {
    case 'move': {
      const next = moveCursor(state.screen, state.section, state.cursor, event.dir, ctx);
      return { phase: 'browsing', screen: state.screen, section: next.section, cursor: next.cursor };
    }
    case 'prevScreen':
      return openScreen(stepScreen(state.screen, 'prev'), ctx);
    case 'nextScreen':
      return openScreen(stepScreen(state.screen, 'next'), ctx);
    case 'screen':
      return openScreen(event.screen, ctx);
    case 'cancel':
      return backOut(state, ctx);
    case 'pause':
      return { phase: 'closing', via: 'continue' };
    // The only confirm that is a STATE change: a status row picks a way out,
    // and the store performs it off the `closing` phase exactly as a pause does.
    // Every other confirm is a write, left to whoever holds the bridge.
    case 'confirm': {
      const target = confirmTargetAt(state, ctx);
      return target?.kind === 'exit' ? { phase: 'closing', via: target.via } : state;
    }
    case 'focus': {
      const at = clampCursor(event.screen, { section: event.section, cursor: event.cursor }, ctx);
      return { phase: 'browsing', screen: event.screen, section: at.section, cursor: at.cursor };
    }
    case 'closed':
      return { phase: 'closed' };
    // A slot press is answered by `assignTargetAt`, not here.
    case 'slot':
    default:
      return state;
  }
};

const reducePause = (state: PauseState, event: PauseEvent, ctx: PauseContext): PauseState => {
  if (event.type === 'opened') return openScreen('items', ctx);
  if (event.type === 'closed') return { phase: 'closed' };
  if (state.phase !== 'browsing') return state;
  return reduceBrowsing(state, event, ctx);
};

/**
 * What the cursor currently points at, or null where nothing is assignable. An
 * UNOWNED item still reports as an item: refusing the assignment is the caller's
 * call, not the cursor's.
 *
 * The two verbs live on the GEAR screen, on the two rows where a confirm means
 * nothing else, so no cell ever has to guess which of the two a press wants:
 *
 *  - the **blade ladder** assigns the sword, as the published wireframe places it;
 *  - the **passive row** assigns the action, because the four abilities drawn there are
 *    the ones the action button performs, it is the one gear row with no tier to
 *    equip, and the verb has to be reachable somewhere.
 *
 * The guard and armour ladders assign nothing: their cells already mean "wear
 * this tier", and there is no guard verb to put on a button.
 *
 * The STATUS screen assigns nothing either. Its two rows are the ways out of the
 * game, not a gameplay verb; the only reason they ever answered `action` is that
 * the section happens to be spelled `actions`. Once a confirm activates them, a
 * slot press that silently rebound a button while the cursor sat on "Save & quit"
 * would be a second, invisible meaning for the same cell.
 */
const assignTargetAt = (state: PauseState, ctx: PauseContext): AssignTarget | null => {
  if (state.phase !== 'browsing') return null;
  if (state.screen === 'items') {
    if (state.section !== 'items' && state.section !== 'bottles') return null;
    const at = clampCursor('items', { section: state.section, cursor: state.cursor }, ctx);
    if (at.section !== 'items' && at.section !== 'bottles') return null;
    const hudItem = hudItemAt(at.section, at.cursor);
    return hudItem === null ? null : { kind: 'item', hudItem };
  }
  if (state.screen !== 'gear') return null;
  if (state.section === 'sword') return { kind: 'sword' };
  return state.section === 'passive' ? { kind: 'action' } : null;
};

export { assignTargetAt, reducePause };
export type { AssignTarget, PauseContext, PauseEvent, PauseScreen, PauseSection, PauseState };
