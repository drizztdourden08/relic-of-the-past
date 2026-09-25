/* @layer renderer-components @kind component */
/**
 * THE SELECTED CONTAINER'S OWN ARRANGEMENT, drawn over the preview in ITS OWN
 * `guide.color`. Editor only, never in the game (`plans/hud-data-binding.html`
 * wireframe 3). Only while the toolbar's grid-view toggle is on. It reads
 * `useHudEditorViewStore` directly, the same precedent `EditorToolbar` already
 * set for this view-only, never-persisted flag.
 *
 * EITHER ENGINE (§57). It was `GridOverlay` and drew grids alone, which made the
 * panel's Overlay control a grid-only control and section one a different
 * section under each engine. A flex container has an arrangement too, only
 * without a lattice, so:
 *
 * - A GRID draws its CELL BOUNDARIES, from the engine's own track solve
 *   (`stageCellRects`, the one door. Its header covers the unit mix-up it
 *   exists to prevent.) A column with no child in it still has lines, which is
 *   precisely the cell the panel's grid editor lets you select.
 * - A FLEX container draws ITS CHILDREN'S SLOTS, from where they were placed
 *   (`stageSlotRects`). There is no solve to read: a flex line has no empty
 *   cells to infer, so the children's rectangles ARE the arrangement, and the
 *   space the flow left between them is visible as the gap it is.
 *
 * PURELY VISUAL. The stage is select-only (§47) and the panel is the one thing
 * that edits a container (§48): this draws outlines and nothing else. No click
 * targets, no writes, `pointer-events: none` throughout, `aria-hidden`.
 */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { stageCellRects, stageSlotRects } from '../behavior/stage-cells';
import type { HudContainer } from '@shared/types/hud';
import type { MeasureContext, PlacedNode } from '@shared/hud/engine';
import type { Rect } from '@shared/hud/layouts/geometry.type';

const DEFAULT_GUIDE = '#c064c0';

interface ContainerOverlayProps {
  container: HudContainer;
  placed: readonly PlacedNode[];
  /** Display pixels per game pixel. The stage draws at the same factor. */
  scale: number;
  ctx: MeasureContext;
}

const sortedUnique = (values: number[]): number[] => [...new Set(values)].sort((a, b) => a - b);

interface Lattice { xs: number[]; ys: number[]; x0: number; y0: number; w: number; h: number }

/** One drawing or the other, never both - which engine decides which. */
type Drawing = { kind: 'grid'; lattice: Lattice } | { kind: 'flex'; slots: Rect[] };

/** Every cell edge, once: the lines a grid has are the boundaries of its cells. */
const latticeOf = (cells: readonly { rect: Rect }[]): Lattice | null => {
  if (cells.length === 0) return null;
  const xs = sortedUnique(cells.flatMap((c) => [c.rect.x, c.rect.x + c.rect.w]));
  const ys = sortedUnique(cells.flatMap((c) => [c.rect.y, c.rect.y + c.rect.h]));
  const x0 = xs[0] ?? 0; const y0 = ys[0] ?? 0;
  return { xs, ys, x0, y0, w: (xs.at(-1) ?? x0) - x0, h: (ys.at(-1) ?? y0) - y0 };
};

const GridLines = (props: { lattice: Lattice; color: string }) => {
  const { xs, ys, x0, y0, w, h } = props.lattice;
  return (
    <>
      {xs.map((x, i) => (
        <Box key={`x${i}`} className="hud-overlay__line hud-overlay__line--v" style={{ left: x, top: y0, height: h, background: props.color }} />
      ))}
      {ys.map((y, i) => (
        <Box key={`y${i}`} className="hud-overlay__line hud-overlay__line--h" style={{ top: y, left: x0, width: w, background: props.color }} />
      ))}
    </>
  );
};

/**
 * INSET BY A PIXEL, AND DASHED (§58). §57.8 photographed the defect and left it
 * standing: the first child starts at the container's own content origin, so its
 * slot's leading borders landed exactly under the gold SELECTION outline and the
 * pair read as one box cut down one side. An inset guarantees the two lines are
 * never co-located whatever the geometry says, and the dash means they cannot be
 * confused even where they nearly touch.
 */
const INSET = 1;

const FlexSlots = (props: { slots: readonly Rect[]; color: string }) => (
  <>
    {props.slots.map((slot, i) => (
      <Box
        key={`s${i}`}
        className="hud-overlay__slot"
        style={{
          left: slot.x + INSET,
          top: slot.y + INSET,
          width: Math.max(slot.w - INSET * 2, 0),
          height: Math.max(slot.h - INSET * 2, 0),
          borderColor: props.color,
        }}
      />
    ))}
  </>
);

const ContainerOverlay = (props: ContainerOverlayProps) => {
  const { container, placed, scale, ctx } = props;
  const enabled = useHudEditorViewStore((s) => s.gridOverlayEnabled);
  const isGrid = container.layout === 'grid';

  const drawing = useMemo<Drawing | null>(() => {
    const own = placed.find((p) => p.id === container.id);
    if (!own) return null;
    if (!isGrid) {
      const slots = stageSlotRects(container, placed, scale);
      return slots.length ? { kind: 'flex', slots } : null;
    }
    const lattice = latticeOf(stageCellRects(own, scale, ctx));
    return lattice ? { kind: 'grid', lattice } : null;
  }, [container, isGrid, placed, scale, ctx]);

  if (!enabled || !drawing) return null;
  const color = container.guide?.color ?? DEFAULT_GUIDE;

  return (
    <Box className="hud-overlay" aria-hidden="true">
      {drawing.kind === 'grid'
        ? <GridLines lattice={drawing.lattice} color={color} />
        : <FlexSlots slots={drawing.slots} color={color} />}
    </Box>
  );
};

export { ContainerOverlay };
export type { ContainerOverlayProps };
