/* @layer renderer-stores @kind logic */
/**
 * The enhanced pause menu's state, and the side effects its reducer refuses to perform.
 *
 * `reducePause` is pure by design: it decides where the cursor IS and never what the game
 * does about it. Everything it declines lands here, because only this layer holds the bridge
 * and the other stores:
 *
 *  - a `slot` press resolves through `assignTargetAt` and becomes an assignment;
 *  - a `confirm` resolves through `planConfirm` and becomes a gear write, a refusal, or
 *    nothing. The one confirm that IS a state change, a status row, the reducer keeps;
 *  - a `closing` phase becomes the matching core exit, continue or save-and-quit.
 *
 * Every one of those arrives the same way whoever pressed it. A pad, a keyboard and the
 * menu's own click handlers all raise the same `PauseEvent` at this one door, which is why
 * the view no longer holds the bridge for a gear tier and the mouse no longer has an exit
 * event of its own.
 *
 * The menu does not decide when it is open. The core does: the host's takeover is armed
 * continuously (byte 129 says only that it is in force), so what actually marks the menu as
 * on screen is the native menu module running underneath it. Both are watched through the
 * game UI store instead of polled, so this costs nothing on a frame that changed nothing.
 */
import { create } from 'zustand';
import type { GameUIState } from '@shared/game/types';
import type { SlotIndex } from '@shared/types/controls';
import type { ConfirmVerb, PauseContext, PauseEvent, PauseState } from '@shared/game/logic/pause';
import {
  arrowTypeOf, assignTargetAt, buildItemCells, confirmVerbAt, firstSectionOf, planAssignment,
  planConfirm, reducePause,
} from '@shared/game/logic/pause';
import { ownedMax } from '@app/lib/game/gear-ownership';
import {
  closeHostMenu, reassertActiveItem, reconcileHostMenu, saveAndQuitHostMenu, setGear,
  wantedActiveItem,
} from '@app/lib/game/host-menu';
import { setMenuSinkOpen, setMenuSinkPush } from '@app/lib/input/scheme-runtime';
import { wasmGetMenuState } from '@app/lib/game/wasm-bridge';
import { useGameUIStore } from './game-ui-store';
import { useControlSchemeStore } from './control-scheme-store';

/**
 * What the cursor can do WHERE IT NOW STANDS. This is the legend's whole content, in three
 * answers, each taken from the rule that performs the thing it describes.
 *
 * The strip used to be a fixed list of six verbs, filtered by one boolean. Two of the
 * six were wrong wherever it was drawn: the map button raises no menu event at all
 * (`menuEdges` emits none), so the bar advertised a control that does nothing on every
 * screen; and BACK is CLOSE on a screen's first section, so the strip named one action
 * twice in different words. The rest were right but silent about the two things a
 * player actually wants to know in an inventory: that a button press assigns, and
 * what a confirm is about to do to the gear they are looking at.
 */
interface PauseCursorActions {
  /** What a confirm does here, or null where a confirm means nothing. */
  confirm: ConfirmVerb | null;
  /** Whether a slot press here would put something on a button. */
  assign: boolean;
  /** Whether cancel goes back to the screen's first section instead of out. */
  back: boolean;
}

interface PauseMenuStore {
  state: PauseState;
  dispatch: (event: PauseEvent) => void;
  /** Mirrors `state.phase !== 'closed'`, so a view can subscribe to just this. */
  open: boolean;
  /**
   * Refused slot presses since the menu opened. A count, not a flag, because
   * the view flashes a line for each one, and two refusals in a row have to read as
   * two answers. Whoever shows it owns how long it stays up; this only says it
   * happened, so a pad press and a mouse click get the same reply.
   */
  refusals: number;
  /**
   * Whether a confirm would do anything where the cursor now stands. The legend reads it
   * and drops its CONFIRM glyph where it would not: an advertised control that does
   * nothing is worse than one the strip never claimed. Derived here instead of in the
   * view because only this layer holds the context the rule is asked against.
   *
   * Kept alongside `cursorActions` (of which it is exactly `confirm !== null`) because
   * the view carries it across the exit slide (see `useVisibleBrowsing`) and a boolean is
   * all that journey needs.
   */
  canConfirm: boolean;
  /**
   * The whole legend's content, refreshed whenever the cursor OR the save moves: taking a
   * blade off changes what confirming that same rung means, and the strip has to say so
   * without the player having to move first.
   */
  cursorActions: PauseCursorActions;
}

const CLOSED: PauseState = { phase: 'closed' };

/** A cursor standing nowhere, because the menu is closed or on its way out. */
const NO_ACTIONS: PauseCursorActions = { confirm: null, assign: false, back: false };

/**
 * The live context the reducer and the view must both read, built from one snapshot so they
 * can never disagree. `activeItem` prefers what the host last wrote over what the buffer
 * reports: on the frame the menu appears the buffer may still carry the value the native
 * init replaced, and opening the cursor on that cell is exactly the confusion byte 130
 * exists to prevent.
 */
const pauseContext = (): PauseContext => {
  const ui = useGameUIStore.getState();
  const cells = buildItemCells(ui.inventory.items, ui.inventory.bottles);
  return {
    owned: cells.map((cell) => cell.owned),
    bottles: ui.inventory.bottles,
    // The arrow row is given the TYPE in force, never the raw register: the other half of
    // that byte is ammunition on hand, and the menu has no business reading or writing it.
    gear: {
      sword: ui.equipment.sword,
      shield: ui.equipment.shield,
      mail: ui.equipment.armor,
      bow: arrowTypeOf(ui.inventory.items[0] ?? 0),
    },
    ownedMax: ownedMax(),
    activeItem: wantedActiveItem() || ui.hostMenu.activeItem,
  };
};

/**
 * The three answers, each asked of the rule that would PERFORM it. `confirmVerbAt` is the
 * same call `planConfirm` plans from, `assignTargetAt` the one `planAssignment` refuses or
 * accepts, `firstSectionOf` the one `backOut` steps through. Nothing here re-derives what
 * the cursor is on, which is the only way the strip and the press can be kept in step.
 */
const cursorActionsAt = (state: PauseState, ctx: PauseContext): PauseCursorActions => ({
  confirm: confirmVerbAt(state, ctx),
  assign: assignTargetAt(state, ctx) !== null,
  back: state.phase === 'browsing' && state.section !== firstSectionOf(state.screen),
});

const sameActions = (a: PauseCursorActions, b: PauseCursorActions): boolean =>
  a.confirm === b.confirm && a.assign === b.assign && a.back === b.back;

/**
 * Re-ask all three, and write only a real change.
 *
 * HELD ACROSS `closing`, for the reason `useVisibleBrowsing` holds the cursor: the machine
 * stops standing anywhere the instant the exit begins, but the menu is still on screen for
 * the whole slide out, and a strip that loses two verbs on its way off the top is the same
 * defect as a panel that swaps to the item grid on its way off the top.
 */
const refreshCursorActions = (): void => {
  const { state, cursorActions } = usePauseMenuStore.getState();
  if (state.phase !== 'browsing') return;
  const next = cursorActionsAt(state, pauseContext());
  if (sameActions(next, cursorActions)) return;
  usePauseMenuStore.setState({ cursorActions: next, canConfirm: next.confirm !== null });
};

/**
 * A slot press assigns whatever the cursor is on. `planAssignment` decides what that means
 * for the pad and the mouse alike, and this performs it: clear the duplicates it names,
 * write the target, and report a refusal so the menu can say why nothing happened.
 */
const assignFromCursor = (state: PauseState, slot: SlotIndex, ctx: PauseContext): boolean => {
  const { assignments, clearAssignment, setAssignment } = useControlSchemeStore.getState();
  const plan = planAssignment(state, ctx, slot, assignments);
  if (plan.outcome !== 'assign') return plan.outcome === 'refused';
  plan.clear.forEach((index) => clearAssignment(index));
  setAssignment(slot, plan.target);
  return false;
};

/**
 * A confirm activates whatever the cursor is on. `planConfirm` decides what that means
 * for the pad, the keyboard and the mouse alike, and this performs the half the reducer
 * cannot: the gear write. Returns false on a refusal, so the menu can say why the tier it
 * drew faded did not go on. An exit is NOT performed here; it is a state change, so the
 * reducer moves to `closing` and `performExit` carries it out, the same door a pause uses.
 */
const performConfirm = (state: PauseState, ctx: PauseContext): boolean => {
  const plan = planConfirm(state, ctx);
  if (plan.outcome === 'refused') return false;
  if (plan.outcome === 'equip') setGear(plan.gear, plan.tier);
  return true;
};

/** What `WasmGetMenuState` calls "open": the native scroll finished and a browse state is running. */
const NATIVE_MENU_OPEN = 2;

/**
 * Will the core accept an exit on this frame?
 *
 * Both exits hand the native machine back to its own close path, and that path only terminates
 * from a menu whose open scroll has finished. `HostMenu_OpenScrollFinished` in host_menu.c
 * refuses every other starting point, because closing from mid-scroll sends the menu's scroll
 * offset the long way round the 16-bit range instead of to zero.
 *
 * The C side is the guard. This is the half that keeps OUR machine honest about it: `closing`
 * accepts no events, so entering it on a request the core just refused would strand the menu in
 * a phase nothing can leave. That is the same soft lock by another road. Asked once per exit request,
 * never per frame, and asked of the machine we are about to command; the menu's own slide is
 * ours and is driven from this store instead (see GameOverlay).
 */
const coreWillExit = (): boolean => wasmGetMenuState() === NATIVE_MENU_OPEN;

/**
 * Entering `closing` is what performs the exit; the core decides when `closed` follows. Returns
 * false when the core refused it, so the caller can drop the phase change along with the write.
 * A pause pressed during the open animation does nothing at all, and can be pressed again.
 */
const performExit = (prev: PauseState, next: PauseState): boolean => {
  if (next.phase !== 'closing' || prev.phase === 'closing') return true;
  if (!coreWillExit()) return false;
  if (next.via === 'save-quit') saveAndQuitHostMenu();
  else closeHostMenu();
  return true;
};

const usePauseMenuStore = create<PauseMenuStore>()((set, get) => ({
  state: CLOSED,
  open: false,
  refusals: 0,
  canConfirm: false,
  cursorActions: NO_ACTIONS,
  dispatch: (event) => {
    const ctx = pauseContext();
    const prev = get().state;
    if (event.type === 'slot') {
      if (assignFromCursor(prev, event.slot, ctx)) set({ refusals: get().refusals + 1 });
      return;
    }
    if (event.type === 'confirm' && !performConfirm(prev, ctx)) {
      set({ refusals: get().refusals + 1 });
      return;
    }
    const next = reducePause(prev, event, ctx);
    // A confirm that WROTE moves no cursor, so it lands here with nothing to set. But what
    // the same rung now offers has changed, and `syncFromGame` re-asks once the core reports
    // the write. That is the honest clock for it: the bar changes when the gear does.
    if (next === prev) return;
    if (!performExit(prev, next)) return;
    const actions = next.phase === 'browsing' ? cursorActionsAt(next, ctx) : get().cursorActions;
    // A fresh open starts with nothing to apologise for.
    set({
      state: next,
      open: next.phase !== 'closed',
      cursorActions: actions,
      canConfirm: actions.confirm !== null,
      ...(event.type === 'opened' ? { refusals: 0 } : {}),
    });
  },
}));

let sinkWired = false;

/**
 * Flip the input router. While open the core is fed nothing the player pressed and the menu
 * receives rising-edge events instead (see frame-router.ts). The sink is wired once, on the
 * first open; the engine itself is not involved, since the router reads the scheme runtime.
 */
const setMenuRouting = (open: boolean): void => {
  if (!sinkWired) {
    sinkWired = true;
    setMenuSinkPush((events) => {
      const { dispatch } = usePauseMenuStore.getState();
      for (const event of events) dispatch(event);
    });
  }
  setMenuSinkOpen(open);
};

/**
 * The core's own view of the menu, once per changed frame: repair any drift in the takeover
 * or the equipped-item register, then open or close on the edge.
 *
 * The item is re-asserted on BOTH edges. On open, because the native menu's init walks the
 * 21-entry grid before the hold matters and replaces any id that grid has no row for. On
 * close, because the exit rebuilds the HUD and re-derives the register from whatever it
 * finds there.
 */
const syncFromGame = (ui: GameUIState): void => {
  reconcileHostMenu(ui.hostMenu);
  // The save is half of what the cursor can do. A tier taken off changes what confirming
  // that rung means without the cursor having moved at all, so the strip is re-asked on
  // the same edge everything else about the game is. It costs one comparison while the
  // menu is closed, which is every frame of ordinary play.
  refreshCursorActions();
  const shouldBeOpen = ui.hostMenu.holding && ui.mode === 'paused_menu';
  const { open, dispatch } = usePauseMenuStore.getState();
  if (shouldBeOpen === open) return;
  reassertActiveItem();
  setMenuRouting(shouldBeOpen);
  dispatch({ type: shouldBeOpen ? 'opened' : 'closed' });
};

useGameUIStore.subscribe(syncFromGame);

// `pauseContext` stays internal: the reducer and the assignment rule are the only things
// that need it, and both are reached through `dispatch`. A view that built its own would be
// a second snapshot of the same save, free to disagree with the one the reducer just used.
export { usePauseMenuStore };
export type { PauseCursorActions, PauseMenuStore };
