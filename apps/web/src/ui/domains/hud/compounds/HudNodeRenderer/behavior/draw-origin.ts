/* @layer renderer-hud @kind logic */
/**
 * Where a placed node's box starts, in SNES px: the one place a solved rect
 * becomes a drawing position, read by `HudNodeRenderer` for every node.
 *
 * THE COUNTDOWN SNAPS TO WHOLE GAME PIXELS, AND NOTHING ELSE DOES. `HudPixelPie`
 * is a canvas of one cell per game pixel scaled up with no smoothing, so it only
 * lines up with the picture under it when its corner sits on a game pixel. The
 * engine is free to answer a fraction (a centred box in a view whose width is not
 * even is half a pixel off), and the engine is right to: rounding there would
 * move the flow every other node is measured by. So the snap happens here, after
 * layout, on the drawing only, for the one kind that needs it (§62). Every other
 * kind keeps the exact rect, so no shipped pixel moves.
 */
import type { PlacedNode } from '@shared/hud/engine';
import type { HudNode } from '@shared/types/hud';

interface DrawOrigin { x: number; y: number }

/** The kinds whose art is drawn on the game's own pixel grid. */
const snapsToGamePixels = (node: HudNode): boolean =>
  node.kind === 'element' && node.element.type === 'countdown';

const drawOrigin = (placed: PlacedNode): DrawOrigin => {
  const { x, y } = placed.rect;
  return snapsToGamePixels(placed.node) ? { x: Math.round(x), y: Math.round(y) } : { x, y };
};

export { drawOrigin, snapsToGamePixels };
export type { DrawOrigin };
