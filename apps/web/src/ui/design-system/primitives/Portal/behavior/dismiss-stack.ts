/* @layer renderer-components @kind util */
/**
 * WHO OWNS `Escape`. One stack and one listener serve every layered surface.
 *
 * THE BUG THIS REPLACES. Eight components each bound their own `keydown` on
 * `document` and hoped ordering would sort them out: the popovers used capture
 * plus `stopPropagation`, `DialogShell` used bubble, the app shell's shortcut
 * used bubble, and `FullScreenLayer` had nothing of its own and was closed by
 * that shortcut. A single press therefore reached several of them, and which
 * one won came down to registration order. That is mount order, which React
 * decides bottom-up and which changes whenever a tree is re-arranged. In the
 * HUD layout editor the shortcut won, so `Escape` over an open picker tore down
 * the whole editor instead of closing the picker.
 *
 * `stopPropagation` cannot fix that. It orders PHASES and NODES, never two
 * listeners on the same node in the same phase, so adding more of it only moves
 * the coin-flip somewhere else.
 *
 * WHAT REPLACES IT. Every dismissible surface registers here instead of binding
 * its own key handler, and this module binds exactly ONE listener for all of
 * them, so there is no second listener left to be ordered against. It picks
 * the winner by LEVEL first (`drag` > `popover` > `menu` > `dialog` > `layer`) and only
 * breaks ties by registration order. Level-first is the whole point: a popover
 * inside a layer beats that layer whether it registered before or after it, so
 * the answer no longer depends on which mounted first.
 *
 * ONE PRESS DISMISSES ONE THING. Only the top entry is notified, and the event
 * is then marked handled and stopped, `stopImmediatePropagation` included, so
 * no listener registered on `document` after this one gets a second go either.
 *
 * STOPPING IT IS CONTAINMENT, NEVER THE GUARANTEE. Nothing an event handler can
 * call reaches a listener that is already on the same node ahead of it, and the
 * app shell's global shortcut is exactly that: bound at start-up, long before
 * any surface exists. That is why the shortcut asks `dismissStackDepth()` and
 * stands down on its own instead of trusting the key to have been swallowed.
 * Any other listener on `document` that acts on `Escape` must do the same.
 *
 * BUBBLE PHASE, ON PURPOSE. React attaches its own handlers to the root
 * container (`#root`), which is a descendant of `document`, so a bubble
 * listener here runs AFTER every `onKeyDown` in the tree. That is what lets an
 * inline editor cancel its own edit on `Escape` without the surface around it
 * closing too: it consumes the key by calling `preventDefault()`, and
 * `defaultPrevented` below is honoured as "already handled". Both halves of
 * that contract are between different nodes of the tree, where the DOM's
 * ordering guarantees are real.
 *
 * NOTHING IS BOUND WHILE THE STACK IS EMPTY. With no layered surface open this
 * module is inert and every pre-existing `Escape` handler behaves exactly as it
 * did before.
 */

/**
 * Ordered inner-most first when read as "what does Escape reach".
 *
 * `drag` SITS ABOVE `popover` because a live drag is the innermost thing there
 * is: it is the only surface in motion, it is modal in practice (nothing else
 * is reachable while a button is held), and it is the shortest-lived. A popover
 * can be open under a drag (leave a sprite picker up, then drag an
 * outline row), and in that state `Escape` must kill the drag, because the drag
 * is what the hand is doing. Registration order would answer that wrong about
 * half the time, which is the same argument one level further in.
 */
type DismissLevel = 'layer' | 'dialog' | 'menu' | 'popover' | 'drag';

const LEVEL_RANK: Readonly<Record<DismissLevel, number>> = {
  layer: 0,
  dialog: 1,
  menu: 2,
  popover: 3,
  drag: 4,
};

interface DismissEntry {
  level: DismissLevel;
  onDismiss: () => void;
  /** Tie-breaker within one level: the later registration is the inner one. */
  seq: number;
}

const entries: DismissEntry[] = [];
let nextSeq = 0;
let bound = false;

/** Highest level wins; within a level, the most recently registered wins. */
const topEntry = (): DismissEntry | null =>
  entries.reduce<DismissEntry | null>((best, entry) => {
    if (!best) return entry;
    const rank = LEVEL_RANK[entry.level] - LEVEL_RANK[best.level];
    return rank > 0 || (rank === 0 && entry.seq > best.seq) ? entry : best;
  }, null);

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  const top = topEntry();
  if (!top) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  top.onDismiss();
};

const bind = (): void => {
  if (bound || typeof document === 'undefined') return;
  document.addEventListener('keydown', handleKeyDown);
  bound = true;
};

const unbind = (): void => {
  if (!bound || typeof document === 'undefined') return;
  document.removeEventListener('keydown', handleKeyDown);
  bound = false;
};

/**
 * Register a surface as dismissible by `Escape`. Returns its own removal
 * function. Call it when the surface closes or unmounts.
 */
const pushDismissable = (level: DismissLevel, onDismiss: () => void): (() => void) => {
  const entry: DismissEntry = { level, onDismiss, seq: nextSeq += 1 };
  entries.push(entry);
  bind();
  return () => {
    const at = entries.indexOf(entry);
    if (at < 0) return;
    entries.splice(at, 1);
    if (entries.length === 0) unbind();
  };
};

/**
 * How many layered surfaces are currently open. The app shell's global
 * `Escape` shortcut asks this and stands down instead of racing the listener
 * above. It is an explicit question with an answer, not a bet on ordering.
 */
const dismissStackDepth = (): number => entries.length;

/** The surface `Escape` would reach right now, or `null` when nothing is open. */
const topDismissLevel = (): DismissLevel | null => topEntry()?.level ?? null;

export { dismissStackDepth, pushDismissable, topDismissLevel };
export type { DismissLevel };
