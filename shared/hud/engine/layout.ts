/* @layer shared-hud @kind logic */
/**
 * The whole document against one view: expand the screen, place it, done.
 *
 * ONE TREE, NOT NINE. There used to be a `regions[]` array beside the screen -
 * nine named anchors, each owning a subtree, with `anchor-rect.ts` inventing a
 * screen coordinate for every one of them. §42 folded them into the screen's
 * own children: the anchors were a 3x3 grid wearing words, and a grid is
 * something the engine already had. So the last place a coordinate was
 * invented is gone, and the file that did it with it - the screen's rectangle
 * IS the view, and everything below it is flow.
 *
 * EXPANSION HAPPENS ONCE, HERE, BEFORE EITHER PASS SEES THE TREE. `repeat`
 * unrolls and `switch` resolves (`expand.ts`) into an ordinary static tree that
 * `measure` and `place` both then walk - exactly the rule
 * `plans/hud-data-binding.html`'s phase 3 build order names: "nothing renders
 * yet... this is the piece everything else assumes cannot fail" applied one
 * phase later, to layout instead of to values.
 *
 * A screen whose `visible` resolves false takes the whole HUD with it. That is
 * the root's privilege and the reason to have one: "hide all of it"
 * is one statement on one node.
 *
 * Pure and total. Same document, same view, same context - same pixels, in the
 * live HUD and in the editor's preview alike.
 */

import { expand } from './expand';
import { place } from './place';
import type { HudLayout } from '../../types/hud/hud-layout';
import type { MeasureContext, PlacedNode } from './engine.type';
import type { Rect, Size } from '../layouts/geometry.type';

/**
 * The screen's own row, and then one GROUP PER DIRECT CHILD of it.
 *
 * The split exists because two surfaces draw the same document and disagree
 * about one part of it: the pause menu re-pins whichever band holds the button
 * map and leaves the rest where it is. That used to key off "which region", and
 * a region is exactly what a direct child of the screen is now - same concept,
 * new list, no reserved id to know about.
 *
 * It reads the groups off `place`'s own output instead of placing each child
 * separately, because a child of a grid cannot be placed on its own: its cell
 * is sized against its siblings. `place` emits parents before children, depth
 * first, so a band is the run that starts at one of the expanded screen's
 * child ids and ends at the next.
 */
const layoutHudBands = (
  doc: HudLayout, view: Size, ctx: MeasureContext = {},
): { screen: PlacedNode[]; bands: PlacedNode[][] } => {
  const root = expand(doc.screen, ctx);
  const full: Rect = { x: 0, y: 0, w: view.w, h: view.h };
  const placed = place(root, full, 1, ctx);
  const starts = new Set(root.children.map((child) => child.id));
  const screen: PlacedNode[] = [];
  const bands: PlacedNode[][] = [];
  let band: PlacedNode[] | null = null;
  placed.forEach((node, index) => {
    if (index > 0 && starts.has(node.id)) { band = []; bands.push(band); }
    (band ?? screen).push(node);
  });
  return { screen, bands };
};

/** Every placed node, parents first - the flattening of the bands above, and
 *  what a caller that draws the whole layout at once wants. */
const layoutHud = (doc: HudLayout, view: Size, ctx: MeasureContext = {}): PlacedNode[] => {
  const { screen, bands } = layoutHudBands(doc, view, ctx);
  return [...screen, ...bands.flat()];
};

/** The one node with this id, or nothing. The editor selects by id and the
 *  tests assert by it; walking the list here keeps that lookup in one place. */
const placedById = (placed: readonly PlacedNode[], id: string): PlacedNode | undefined =>
  placed.find((node) => node.id === id);

export { layoutHud, layoutHudBands, placedById };
