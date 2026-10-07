/* @layer electron-main @kind logic */
/**
 * The maths of snapping a dragged window against others: pure, no Electron.
 * A window within SNAP pixels of another's edge, and sharing some span along
 * that edge, jumps flush against it. The nearest such edge wins.
 */
import type { DockEdge, SnapLink, WidgetId, WindowBounds } from '@shared/types/widget-layout';

/** Within this many pixels of an edge, the window snaps to it. */
const SNAP = 14;

interface SnapTarget {
  to: 'main' | WidgetId;
  bounds: WindowBounds;
}

interface Snapped {
  bounds: WindowBounds;
  link: SnapLink;
}

interface Candidate {
  edge: DockEdge;
  distance: number;
  x: number;
  y: number;
}

const spansOverlap = (aStart: number, aLength: number, bStart: number, bLength: number): boolean =>
  aStart < bStart + bLength && bStart < aStart + aLength;

/** The four ways `moving` could sit flush against `target`, with how far it is from each. */
const candidates = (moving: WindowBounds, target: WindowBounds): Candidate[] => {
  const beside = spansOverlap(moving.y, moving.height, target.y, target.height);
  const stacked = spansOverlap(moving.x, moving.width, target.x, target.width);
  const out: Candidate[] = [];
  if (beside) {
    const rightOf = target.x + target.width;
    out.push({ edge: 'right', distance: Math.abs(moving.x - rightOf), x: rightOf, y: moving.y });
    out.push({ edge: 'left', distance: Math.abs(moving.x + moving.width - target.x), x: target.x - moving.width, y: moving.y });
  }
  if (stacked) {
    const below = target.y + target.height;
    out.push({ edge: 'bottom', distance: Math.abs(moving.y - below), x: moving.x, y: below });
    out.push({ edge: 'top', distance: Math.abs(moving.y + moving.height - target.y), x: moving.x, y: target.y - moving.height });
  }
  return out;
};

/** Where the dragged window should land and what it links to, or null when nothing is near. */
const snapTo = (moving: WindowBounds, targets: SnapTarget[]): Snapped | null => {
  let best: (Candidate & { to: SnapTarget['to'] }) | null = null;
  for (const target of targets) {
    for (const c of candidates(moving, target.bounds)) {
      if (c.distance <= SNAP && (!best || c.distance < best.distance)) best = { ...c, to: target.to };
    }
  }
  if (!best) return null;
  return { bounds: { ...moving, x: best.x, y: best.y }, link: { to: best.to, edge: best.edge } };
};

const shifted = (bounds: WindowBounds, dx: number, dy: number): WindowBounds =>
  ({ ...bounds, x: bounds.x + dx, y: bounds.y + dy });

export { SNAP, shifted, snapTo };
export type { SnapTarget, Snapped };
