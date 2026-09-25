/* @layer renderer-components @kind logic */
/**
 * WHAT THE GHOST SAYS. It is three lines in a fixed order, computed from an intent
 * and nothing else.
 *
 * The maintainer asked for one thing specifically: "the dragging ghosts overlay
 * should state what kind of container they are when dragging". That is line 1.
 * The rest of the card is what the band walk makes NECESSARY: if a gesture can
 * silently be operating three levels deeper than you think, it owes a readout of
 * which level it chose.
 *
 * THE KIND, NOT THE NAME. A container's id is already on the breadcrumb; what
 * the author cannot see from the boxes on screen is WHICH ENGINE is about to
 * place their node. Dropping into a `row` and dropping into a `grid 3×2` are
 * different operations with different indicators, so the top line is where that
 * is declared. It speaks §42's vocabulary and only §42's: `row`, `column`,
 * `grid 3×2`, `overlap`, `screen`. THERE IS NO `stack`.
 *
 * `overlap` IS A UI WORD, NEVER A DOCUMENT ONE. It is a grid whose children all
 * name one cell - recognised by shape (`isOverlay`, the same predicate
 * `validate-motion-warnings.ts` reads) instead of by a keyword, because
 * inventing a document kind for it would undo the model change this is built on.
 * Say `overlap`, write `grid`.
 *
 * REFUSED NAMES BOTH NODES, and the whole card turns, not one word of it,
 * so the state is readable in peripheral vision without parsing anything. §43
 * recorded that a refused drop currently gives NO feedback at all - the row
 * highlight was removed on the understanding that this would be the full answer.
 * "invalid target" is not a sentence anyone can act on; `refusalText` is.
 *
 * THE NUDGE IS NOT THE SAME OBJECT. Three simultaneous differences on purpose -
 * a different tone, a different top-line word, and numbers where a position
 * would be - because the two gestures are now the same pointer on the same
 * pixels and a wrong guess writes the document.
 *
 * NO REACT AND NO DOM: it is a pure function of the document and one intent,
 * which is what lets every sentence on the card be a test. It is also, flattened,
 * exactly what phase 6's `aria-live` announcement will read.
 */
import { assignCells, rowCountOf } from '@shared/hud/engine';
import { isOverlay } from '@shared/hud/layouts';
import { refusalText } from './drop-intent';
import { siteOf } from './node-edits';
import { ancestorIdsOf, enclosingRepeatOf } from './tree-context';
import type { DropIntent } from './drop-intent';
import type { HudGridContainer, HudLayout, HudNode } from '@shared/types/hud';

/** The card's whole state, and what turns it: `move` is accent, `refused` turns
 *  the whole card. */
type GhostTone = 'move' | 'refused';

interface GhostModel {
  tone: GhostTone;
  /** Line 1, the chip: the dragged node, by the id the outline shows. */
  chip: string;
  /** Line 1, the verb: `into column`, `into grid 3x2`, `refused`. */
  kind: string;
  /** Line 2: the position it would take, or the refusal, or the delta. */
  position: string;
  /** Line 3: the path, root to target. */
  path: string;
  /** Line 3 is a warning such as `inside repeat ×8` instead of a path. */
  warn: boolean;
}

/** How many rows a grid actually has: the declared list, or as many as the
 *  auto-flow needs. The same two functions the engine sizes tracks with, so the
 *  number on the card is the number in the layout. */
const gridSize = (node: HudGridContainer): string =>
  `grid ${node.columns.length}×${Math.max(1, rowCountOf(assignCells(node.children, Math.max(1, node.columns.length)).values()))}`;

/** §42's vocabulary, and only §42's. */
const containerKind = (node: HudNode | null, isScreen: boolean): string => {
  if (isScreen) return 'screen';
  if (!node || node.kind !== 'container') return 'leaf';
  if (node.layout !== 'grid') return node.direction;
  // TWO children, not one. `isOverlay` is trivially true of a grid with a
  // single explicitly-placed child, which is right for the reflow warning it
  // was written for (one child reflows nobody) and wrong as a NAME: a 3x2 grid
  // holding one node is a grid, not an overlay.
  return node.children.length > 1 && isOverlay(node) ? 'overlap' : gridSize(node);
};

/** Root to target, target last. It tells the author how far out to move when
 *  the drop is refused, and which level the band walk actually chose when it is
 *  not. */
const pathTo = (doc: HudLayout, id: string): string =>
  [...ancestorIdsOf(doc, id), id].join(' › ');

/** The one thing no other surface in the editor says: this container draws N
 *  times, so the node about to land in it will too. */
const repeatWarning = (doc: HudLayout, id: string): string | null => {
  const repeat = enclosingRepeatOf(doc, id);
  if (!repeat) return null;
  return typeof repeat.count === 'number' ? `inside repeat ×${repeat.count}` : 'inside repeat';
};

/** In "position 2 of 3" the count is the target's child count AFTER the removal
 *  when the node is already in that parent, which is `moveNode`'s own rule for
 *  what the index resolves against. */
const flexPosition = (doc: HudLayout, parentId: string, index: number, ids: readonly string[]): string => {
  const target = siteOf(doc, parentId)?.node;
  const children = target?.kind === 'container' ? target.children : [];
  const leaving = ids.filter((id) => children.some((child) => child.id === id)).length;
  return `position ${index + 1} of ${children.length - leaving + 1}`;
};

/** The line that separates an empty cell from a co-place. The word `with` IS the
 *  difference, and it is why one indicator is a solid wash and the other is
 *  hatched: co-placing is how an overlay gets authored, not a collision. */
const gridPosition = (place: { column?: number; row?: number }, onto: string | null): string =>
  `cell ${place.column ?? 1},${place.row ?? 1} ${onto ? `· with ${onto}` : '· empty'}`;

/**
 * The four states, from one intent.
 *
 * §44 had a fifth, `nudge`, for the stage's margin drag. §46 removed the stage's
 * ghost along with the rest of the stage's drop surface, so there is no card to
 * say it on: the nudge is the stage's own unmodified gesture again and shows the
 * moved rect itself, which is the whole readout it had before §44.
 */
const ghostFor = (doc: HudLayout, ids: readonly string[], intent: DropIntent): GhostModel => {
  const chip = ids[0] ?? '';
  if (intent.kind === 'refused') {
    return {
      tone: 'refused',
      chip,
      kind: 'refused',
      position: refusalText(doc, ids, intent) ?? 'refused',
      path: intent.parentId ? pathTo(doc, intent.parentId) : '',
      warn: false,
    };
  }
  const target = siteOf(doc, intent.parentId)?.node;
  const kind = containerKind(target ?? null, intent.parentId === doc.screen.id);
  const warning = repeatWarning(doc, intent.parentId);
  return {
    tone: 'move',
    chip,
    kind: `into ${kind}`,
    position: intent.kind === 'flex'
      ? flexPosition(doc, intent.parentId, intent.index, ids)
      : gridPosition(intent.place, intent.onto),
    path: warning ?? pathTo(doc, intent.parentId),
    warn: warning !== null,
  };
};

/**
 * THE SAME CARD, FLATTENED INTO A SENTENCE. The outline's `aria-live`
 * region reads it after a move, and it is the check the ghost was designed to pass.
 *
 * The plan's own test of the design is that the card's content makes a sentence:
 * "if the ghost's content does not make a sentence, the ghost is decorative". So
 * this takes the MODEL and not the intent, deliberately: it cannot drift
 * from what the card said, because there is nothing here to drift with. A move
 * that only exists as a repaint is not accessible even when the key works.
 *
 * The refusal reads "can't move X. <reason>" and stops there, where the plan's
 * example also named the target ("can't move hearts INTO PIP 3. pip 3 is
 * already inside hearts"). §43.2's `refusalText` already names BOTH nodes, so
 * the target would arrive twice in one sentence; the plan wrote that example
 * before the refusal sentence did its own naming.
 */
const announcementFor = (model: GhostModel): string => (
  model.tone === 'refused'
    ? `can't move ${model.chip}. ${model.position}`
    : `${model.chip} moved ${model.kind}, ${model.position}`
);

/** Below-right of the cursor. Anything under about 10 px covers the thing it is
 *  describing: an insertion line is 2 px wide and its caps reach 3 px. */
const GHOST_OFFSET = { x: 14, y: 18 };
/** How close to the viewport's own edge before the card flips to the other side
 *  of the cursor. `usePickerPopover` already has the same reflex. */
const GHOST_EDGE = 150;

/**
 * Where the card sits, as a style. The flip is a TRANSLATION instead of a
 * measured left/top, so the card never has to be laid out once to find out how
 * wide it is. That layout pass would make it lag the cursor by a frame, and a
 * ghost that lags reads as latency.
 */
const ghostPosition = (
  point: { x: number; y: number }, viewport: { w: number; h: number },
): { left: number; top: number; transform: string } => {
  const flipX = viewport.w - point.x < GHOST_EDGE;
  const flipY = viewport.h - point.y < GHOST_EDGE;
  return {
    left: point.x + (flipX ? -GHOST_OFFSET.x : GHOST_OFFSET.x),
    top: point.y + (flipY ? -GHOST_OFFSET.y : GHOST_OFFSET.y),
    transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})`,
  };
};

export { GHOST_EDGE, GHOST_OFFSET, announcementFor, containerKind, ghostFor, ghostPosition, pathTo };
export type { GhostModel, GhostTone };
