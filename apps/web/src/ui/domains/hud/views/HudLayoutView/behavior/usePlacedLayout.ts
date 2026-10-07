/* @layer renderer-hud @kind hook */
/**
 * The document, solved once per frame against the display it is actually on
 * and split into the button map and everything else.
 *
 * WHY THE SPLIT. Two surfaces draw the same document at once and they disagree
 * about exactly one part of it. The gameplay HUD draws all of it; the enhanced
 * pause menu draws its own copy of the button map, pinned to its right-hand
 * column, while the vitals and the wallet stay where they are and stay readable
 * underneath the menu. So the map has to be separable from the rest, and it is
 * separated by what it CONTAINS, not by a name: a BAND holds the button
 * map when something in it draws a numbered slot. A custom layout gets the same
 * treatment as a shipped one, with no reserved id to know about.
 *
 * A BAND IS A DIRECT CHILD OF THE SCREEN. It is what a `regions[]` entry became in
 * §42. Same concept, new list: the split used to key off "which region", and a
 * region was exactly one subtree hanging off the root. `layoutHudBands` reads
 * the groups off the one layout pass instead of running the engine once per
 * band, because a child of a grid cannot be placed on its own: its cell is
 * sized against its siblings.
 *
 * `bounds` is the map's own outer rectangle, item overhang included, because it
 * is the union of every rectangle the engine reported. That is what a caller
 * pins into a column; there is no second measurement of the cluster anywhere.
 */
import { useMemo } from 'react';
import { layoutHudBands } from '@shared/hud/engine';
import type { HudLayout } from '@shared/types/hud';
import type { MeasureContext, PlacedNode } from '@shared/hud/engine';
import type { Rect, Size } from '@shared/hud/layouts';

interface PlacedLayout {
  /** Every placed node, in document order, for a caller that draws the whole
   *  layout at once. */
  all: readonly PlacedNode[];
  /** The bands that draw at least one numbered slot. */
  buttons: readonly PlacedNode[];
  /** Everything else. */
  rest: readonly PlacedNode[];
  /** The button map's outer rectangle in SNES px, or null when it draws none. */
  bounds: Rect | null;
}

const drawsASlot = (nodes: readonly PlacedNode[]): boolean =>
  nodes.some((placed) => placed.node.kind === 'element' && placed.node.element.type === 'slot');

const unionOf = (nodes: readonly PlacedNode[]): Rect | null => {
  if (nodes.length === 0) return null;
  const rects = nodes.map((placed) => placed.rect);
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  };
};

const placeLayout = (doc: HudLayout, view: Size, ctx: MeasureContext): PlacedLayout => {
  const { screen, bands } = layoutHudBands(doc, view, ctx);
  const all: PlacedNode[] = [...screen];
  const buttons: PlacedNode[] = [];
  // The screen's own row rides with `rest`: it is the ground the whole layout
  // sits on, and the pause menu re-pins the map alone.
  const rest: PlacedNode[] = [...screen];

  bands.forEach((placed) => {
    all.push(...placed);
    (drawsASlot(placed) ? buttons : rest).push(...placed);
  });

  // The map's ink, not its containers: a container's box is the field its
  // children flow in and can reach past them, which would pin the wrong edge.
  const ink = buttons.filter((placed) => placed.node.kind === 'element');
  return { all, buttons, rest, bounds: unionOf(ink) };
};

/** `ctx` is a dependency by identity, so a caller memoizes it over the two
 *  primitives it is built from instead of rebuilding it every render. */
const usePlacedLayout = (doc: HudLayout, view: Size, ctx: MeasureContext): PlacedLayout =>
  useMemo(() => placeLayout(doc, view, ctx), [doc, view, ctx]);

export { placeLayout, usePlacedLayout };
export type { PlacedLayout };
