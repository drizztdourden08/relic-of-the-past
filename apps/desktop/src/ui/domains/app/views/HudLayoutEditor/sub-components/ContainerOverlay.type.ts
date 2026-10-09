/* @layer renderer-components @kind types */
import type { HudContainer } from '@rotp/hud';
import type { MeasureContext, PlacedNode } from '@rotp/hud';
import type { Rect } from '@rotp/hud';

interface ContainerOverlayProps {
  container: HudContainer;
  placed: readonly PlacedNode[];
  scale: number;
  ctx: MeasureContext;
}

interface Lattice { xs: number[]; ys: number[]; x0: number; y0: number; w: number; h: number }

type Drawing = { kind: 'grid'; lattice: Lattice } | { kind: 'flex'; slots: Rect[] };

interface OverlayGridLinesProps { lattice: Lattice; color: string }

interface OverlayFlexSlotsProps { slots: readonly Rect[]; color: string }

export type { ContainerOverlayProps, Drawing, Lattice, OverlayFlexSlotsProps, OverlayGridLinesProps };
