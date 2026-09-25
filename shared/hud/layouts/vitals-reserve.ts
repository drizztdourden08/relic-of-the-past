/* @layer shared-hud @kind logic */
/**
 * The rectangle the shipped vitals occupy, MEASURED, not written down.
 *
 * Anything that has to sit next to the vitals - the pause menu's tab strip, an
 * editor's reserved corner - needs their outer edge, and that edge is a
 * consequence of a whole band of the default layout: a row of a column and a
 * counts block, each at its own intrinsic size, inside that band's margins.
 * Copying it out as a literal is what put a 96x40 block in one file and a 96x49
 * block in another, and then a tab strip at the old block's bottom edge. So it
 * is derived by running the SAME layout pass the renderer runs, over the SAME
 * shipped document: re-author `built-in/default.json` and this moves with it.
 *
 * It is the vitals' BAND - a direct child of the screen, what a region became
 * in §42 - found by what it draws, not by an id: the band that holds the
 * life block is the vitals, in any document. Nothing here knows a node name.
 *
 * Measured at the FULL heart count, because everything beside the life block is
 * fixed while the block's height is not. A reserve taken at the count the
 * current save happens to hold is correct until the player's eleventh
 * container - which is exactly the bug this file exists to stop repeating.
 */

import { DEFAULT_LAYOUT } from './built-in-layouts';
import { DEFAULT_HEARTS } from './element-sizes';
import { layoutHudBands } from '../engine/layout';
import type { PlacedNode } from '../engine/engine.type';
import type { Rect, Size } from './geometry.type';

/**
 * 16:9 at 224 lines - the narrowest display a host-drawn style allows, and the tightest
 * the reserve can be. The vitals are top-left anchored in every shipped layout,
 * so this changes nothing today; it matters only if a layout ever anchors them
 * to an edge that moves with the display, in which case the narrowest field is
 * the honest one to measure against.
 */
const REFERENCE_VIEW: Size = { w: 398, h: 224 };

const EMPTY: Rect = { x: 0, y: 0, w: 0, h: 0 };

/** The band that draws the life block, and nothing else in the document.
 *  The `life` element kind is gone (phase 5, `plans/hud-data-binding.html`) -
 *  the `hearts` preset draws a heart as a `{ type: 'shape', shape: 'heart' }`
 *  leaf instead, so that is what this looks for now. */
const drawsLife = (nodes: readonly PlacedNode[]): boolean =>
  nodes.some((placed) => (
    placed.node.kind === 'element' && placed.node.element.type === 'shape' && placed.node.element.shape === 'heart'
  ));

const unionOf = (rects: readonly Rect[]): Rect => {
  if (rects.length === 0) return { ...EMPTY };
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  };
};

/** Eighths per heart container - the plan's own unit for `life_max`/`life_current`. */
const HEALTH_UNITS_PER_HEART = 8;

const vitalsReserve = (hearts: number = DEFAULT_HEARTS, view: Size = REFERENCE_VIEW): Rect => {
  // The `hearts` preset's own repeat count reads `life_max` off the data
  // scope now, not a `hearts` measure-context field - the block's height at
  // full capacity is measured by handing it a scope that says so.
  const scope = { life_max: hearts * HEALTH_UNITS_PER_HEART };
  const placed = layoutHudBands(DEFAULT_LAYOUT, view, { scope }).bands.find(drawsLife) ?? [];
  return unionOf(placed.filter((node) => node.node.kind === 'element').map((node) => node.rect));
};

/**
 * The shipped block: `{ x: 8, y: 6, w: 116, h: 38 }` - life 8..88 x 6..22,
 * magic 8..88 x 28..44, the counts BESIDE them at 94..124 x 6..30. Right edge
 * 124, bottom edge 44.
 *
 * The bottom edge is the number the pause menu cares about: its panels start at
 * y 56, so 44 leaves twelve px of clear field. That is why the counts sit in a
 * second column instead of a third row - stacked three deep they reach y 74,
 * eighteen px PAST the panels' own origin. Anything that puts a third element
 * back under the meter has to answer for those twelve px again.
 */
const VITALS_RESERVE: Rect = vitalsReserve();

export { REFERENCE_VIEW, VITALS_RESERVE, vitalsReserve };
