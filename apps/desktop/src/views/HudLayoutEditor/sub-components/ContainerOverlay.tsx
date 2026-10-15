/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { stageCellRects } from '@app/hud-layout-editing/stage-cells';
import { stageSlotRects } from '@app/hud-layout-editing/stage-slot-rects';
import { DEFAULT_GUIDE } from './ContainerOverlay.constants';
import { OverlayFlexSlots } from './OverlayFlexSlots';
import { OverlayGridLines } from './OverlayGridLines';
import type { Rect } from '@rotp/hud';
import type { ContainerOverlayProps, Drawing, Lattice } from './ContainerOverlay.type';

const sortedUnique = (values: number[]): number[] => [...new Set(values)].sort((a, b) => a - b);

const latticeOf = (cells: readonly { rect: Rect }[]): Lattice | null => {
  if (cells.length === 0) return null;
  const xs = sortedUnique(cells.flatMap((c) => [c.rect.x, c.rect.x + c.rect.w]));
  const ys = sortedUnique(cells.flatMap((c) => [c.rect.y, c.rect.y + c.rect.h]));
  const x0 = xs[0] ?? 0; const y0 = ys[0] ?? 0;
  return { xs, ys, x0, y0, w: (xs.at(-1) ?? x0) - x0, h: (ys.at(-1) ?? y0) - y0 };
};

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
        ? <OverlayGridLines lattice={drawing.lattice} color={color} />
        : <OverlayFlexSlots slots={drawing.slots} color={color} />}
    </Box>
  );
};

export { ContainerOverlay };
