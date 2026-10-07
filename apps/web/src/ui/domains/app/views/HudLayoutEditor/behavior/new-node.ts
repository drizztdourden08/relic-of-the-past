/* @layer renderer-components @kind logic */
/**
 * Everything the toolbar can insert, built here and nowhere else.
 *
 * One factory per insertable kind, each producing a node that is already valid
 * on its own: a fresh id, and the minimum a validator will accept. Nothing sets
 * a size, a margin or a scale. A newly inserted element takes its intrinsic
 * size and its place in the flow, and the inspector is where it is then tuned.
 * Seeding defaults here would put a second opinion about layout in the editor,
 * beside the document's own.
 *
 * THE LABEL IS THE OUTLINE'S, NOT THE DOCUMENT'S. `labelOf` is how a node reads
 * in the tree; the document stores only the id and the spec, so renaming what a
 * kind is called never touches a saved file.
 */
import { newId } from '@shared/storage/id';
import type {
  HudElement, HudElementSpec, HudFlexContainer, HudGridContainer, HudNode,
} from '@shared/types/hud';

/** Short, stable, and readable in a saved file, because the id shows in the outline. */
const nodeId = (prefix: string): string => `${prefix}-${newId().slice(0, 6)}`;

const newContainer = (direction: HudFlexContainer['direction']): HudFlexContainer => ({
  kind: 'container',
  id: nodeId(direction),
  direction,
  children: [],
});

/**
 * A GRID IS NOW INSERTABLE, which it was not until phase 7 of
 * `plans/hud-inspector-ux-review.html`. `place-grid.ts`, `grid-cells.ts`, the
 * template editor and the stage overlay have all shipped, and yet no layout in
 * the repo used `layout: 'grid'` and the toolbar could not make one. The only
 * path to a grid was flipping a flex container's engine in the inspector, which
 * you had to already know was there. Two `auto` tracks each way instead of the
 * type's bare minimum of one column: a 1x1 grid draws nothing recognisable in
 * the template editor's miniature, and two-by-two is the smallest thing that
 * reads as a grid the moment it lands.
 */
const newGrid = (): HudGridContainer => ({
  kind: 'container',
  id: nodeId('grid'),
  layout: 'grid',
  columns: ['auto', 'auto'],
  rows: ['auto', 'auto'],
  children: [],
});

/**
 * AN OVERLAY, IN ONE CLICK. Every overlay in this project is a one-cell grid
 * whose children all name that cell (§42, which is what `direction: 'stack'`
 * became), and hand-authoring `place: { column: 1, row: 1 }` on every child is
 * exactly the kind of bookkeeping a preset exists to spare. Children dropped
 * into it still need their own cell - `GridEditor` writes it, and clicking the
 * single cell of a 1x1 lattice is the whole gesture (§48).
 */
const newOverlap = (): HudGridContainer => ({
  kind: 'container',
  id: nodeId('overlay'),
  layout: 'grid',
  columns: ['auto'],
  rows: ['auto'],
  justifyItems: 'start',
  alignItems: 'start',
  children: [],
});

const newElement = (spec: HudElementSpec): HudElement => ({
  kind: 'element',
  id: nodeId(spec.type),
  element: spec,
});

/** A bare placeholder child - the minimum a `repeat`/`switch` branch needs to
 *  be a valid node on its own; the outline is where it is then replaced with
 *  something real. */
const placeholderChild = (): HudNode => ({ kind: 'element', id: nodeId('spacer'), element: { type: 'spacer' } });

/** One factory per new phase-3 kind (`plans/hud-data-binding.html`), each
 *  producing the minimum a validator accepts - the inspector (a later phase)
 *  is where every one of these defaults is then actually tuned. */
const newText = (): HudElement => newElement({
  type: 'text', value: 'Text', face: { from: 'font', family: 'sans', size: 16 },
});

const newButton = (): HudElement => newElement({
  type: 'button',
  bind: { kind: 'slot', index: 1 },
  states: { idle: { from: 'glyph', pack: 'generic', glyph: 'DPAD' } },
});

const newRepeat = (): HudElement => newElement({ type: 'repeat', count: 1, child: placeholderChild() });

const newSwitch = (): HudElement => newElement({
  type: 'switch', cases: [{ when: '1', node: placeholderChild() }],
});

/** The countdown pie (§62). No `variant`: a fresh one follows the profile's own
 *  pie, and the inspector's Content section is where a node pins one. */
const newCountdown = (): HudElement => newElement({ type: 'countdown' });

/** What the outline calls a node. Containers say their direction; elements say
 *  what they draw, with the number or the button that makes them distinct. */
const labelOf = (node: HudNode): string => {
  if (node.kind === 'container') return node.layout === 'grid' ? 'grid' : node.direction;
  const spec = node.element;
  switch (spec.type) {
    case 'glyph':
      return spec.slot !== undefined ? `glyph of slot ${spec.slot}` : `glyph ${spec.position ?? '?'}`;
    case 'slot': return `slot ${spec.index}`;
    case 'sprite': return `sprite ${spec.file}`;
    case 'button': return spec.bind.kind === 'slot' ? `button (slot ${spec.bind.index})` : `button (${spec.bind.verb})`;
    case 'countdown': return spec.variant && spec.variant !== 'setting' ? `countdown (${spec.variant})` : 'countdown';
    default: return spec.type;
  }
};

/** Every slot number a node names. It flags an out-of-range slot in the
 *  outline, and the stage's selection reads it to explain itself. */
const slotsOf = (node: HudNode): number[] => {
  if (node.kind !== 'element') return [];
  const spec = node.element;
  if (spec.type === 'slot') return [spec.index];
  if (spec.type === 'glyph' && spec.slot !== undefined) return [spec.slot];
  if (spec.type === 'button' && spec.bind.kind === 'slot') return [spec.bind.index];
  return [];
};

export {
  labelOf, newButton, newContainer, newCountdown, newElement, newGrid, newOverlap, newRepeat, newSwitch, newText,
  nodeId, placeholderChild, slotsOf,
};
