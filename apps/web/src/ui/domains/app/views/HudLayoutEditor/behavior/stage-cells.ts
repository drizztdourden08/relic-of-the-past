/* @layer renderer-components @kind logic */
/**
 * A placed container's drawable rectangles, in DISPLAY pixels. This is the one door
 * the stage's overlay drawings go through. A GRID's cells come from the engine's
 * own track solve; a FLEX container's slots are where its children actually
 * landed. Both leave here in the same space.
 *
 * `gridCellRects(container, box, unit, ctx)` has a contract that is easy to
 * break and looks fine when broken: `box` and the rectangles it returns share
 * ONE coordinate space, and `unit` is that space's pixels per AUTHORED pixel.
 * The engine calls it with the container's game-px rect and the container's
 * own scale, and gets game px back.
 *
 * Both stage drawings used to pass the game-px rect with the DISPLAY scale as
 * `unit`, then paint the answer as display px. Fixed tracks came out the right
 * size, which is why it looked plausible, but the area a `fill` track shares
 * stayed in game px, so the whole grid was drawn `1 / displayScale` of its real
 * size: selecting all nine cells of the screen lit 72 % of the stage at a 1.39
 * scale, and column 3 ended where that 72 % did, nowhere near the buttons.
 *
 * So the conversion lives here, once: solve in game px with the container's
 * OWN placed scale, then multiply by the display scale. A caller cannot mix the
 * two because it never sees either half.
 */
import { gridCellRects } from '@shared/hud/engine/place-grid';
import type { GridCellRect } from '@shared/hud/engine/place-grid';
import type { MeasureContext, PlacedNode } from '@shared/hud/engine';
import type { HudContainer, HudGridContainer } from '@shared/types/hud';
import type { Rect } from '@shared/hud/layouts/geometry.type';

const scaled = (rect: Rect, displayScale: number): Rect => ({
  x: rect.x * displayScale,
  y: rect.y * displayScale,
  w: rect.w * displayScale,
  h: rect.h * displayScale,
});

/** `host` must be a placed GRID container; its `scale` is the unit its own
 *  children were laid out at, which is exactly what the solve wants. */
const stageCellRects = (host: PlacedNode, displayScale: number, ctx: MeasureContext): GridCellRect[] =>
  gridCellRects(host.node as HudGridContainer, host.rect, host.scale, ctx).map((cell) => ({
    ...cell,
    rect: scaled(cell.rect, displayScale),
  }));

/**
 * A FLEX container's slots: the box each of its children was actually placed
 * in, so the space the flow left between them reads as a gap (§57).
 *
 * THERE IS NOTHING TO SOLVE HERE, AND THAT IS THE POINT. A grid has empty cells
 * no child touches, so its lines must come from the track solve; a flex line has
 * none, because a child either took part in the flow or left it entirely
 * (`place-flow.ts`'s `collapsed`), so where the children landed IS the
 * arrangement. The one conversion left is the display scale, and it lives beside
 * the grid's so both drawings read one file instead of agreeing by convention.
 *
 * Placed ids are unique after `expand.ts` (a repeat suffixes `#i`), so matching
 * the container's own children by id cannot pick up another instance's.
 */
const stageSlotRects = (
  container: HudContainer, placed: readonly PlacedNode[], displayScale: number,
): Rect[] => {
  const ids = new Set(container.children.map((child) => child.id));
  return placed.filter((node) => ids.has(node.id)).map((node) => scaled(node.rect, displayScale));
};

export { stageCellRects, stageSlotRects };
