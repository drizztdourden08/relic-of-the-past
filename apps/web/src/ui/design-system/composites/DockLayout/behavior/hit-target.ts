/* @layer renderer-components @kind logic */
/**
 * The drop zones a drag can land on, from the rects the layout produced: outer
 * strips along the window's edges that span the whole window, a compass on
 * every leaf (four arrows that split it, and a centre that joins a pane's tabs),
 * the game's open picture for floating, and the nearest edge of whatever leaf
 * the pointer is over as the fallback.
 */
import type { DockEdge, DropTarget, Rect } from '@shared/types/widget-layout';
import type { LaidOut } from './layout-tree';

/** How wide the outer strips are, and how big a compass button is and how far the arrows sit from the centre. */
const OUTER = 22;
const COMPASS = 40;
const OFFSET = 46;

interface DragSubject {
  /** The leaf being dragged, when it comes from the tree. */
  fromKey: string | null;
  isGame: boolean;
  /** A pane whose only widget is being dragged: dropping on it would remove its target. */
  loneWidget: boolean;
}

interface DropZone {
  target: DropTarget;
  /** Where the pointer must be. */
  hit: Rect;
  /** What the drop would give; null for a float, which the caller works out. */
  preview: Rect | null;
  kind: 'outer' | 'compass' | 'float';
}

const EDGES: readonly DockEdge[] = ['left', 'right', 'top', 'bottom'];

const inRect = (p: { x: number; y: number }, r: Rect): boolean =>
  p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;

const half = (rect: Rect, edge: DockEdge): Rect => {
  switch (edge) {
    case 'left': return { ...rect, width: rect.width / 2 };
    case 'right': return { ...rect, x: rect.x + rect.width / 2, width: rect.width / 2 };
    case 'top': return { ...rect, height: rect.height / 2 };
    case 'bottom': return { ...rect, y: rect.y + rect.height / 2, height: rect.height / 2 };
  }
};

const outerZones = (stage: Rect, isGame: boolean): DropZone[] => {
  const f = isGame ? 0.7 : 0.22;
  return EDGES.map((edge) => {
    const hit = edge === 'left' ? { ...stage, width: OUTER }
      : edge === 'right' ? { ...stage, x: stage.x + stage.width - OUTER, width: OUTER }
        : edge === 'top' ? { ...stage, height: OUTER }
          : { ...stage, y: stage.y + stage.height - OUTER, height: OUTER };
    const preview = edge === 'left' ? { ...stage, width: stage.width * f }
      : edge === 'right' ? { ...stage, x: stage.x + stage.width * (1 - f), width: stage.width * f }
        : edge === 'top' ? { ...stage, height: stage.height * f }
          : { ...stage, y: stage.y + stage.height * (1 - f), height: stage.height * f };
    return { target: { at: 'outer', edge }, hit, preview, kind: 'outer' };
  });
};

/** True when dropping on this leaf would land on the very pane the drag empties. */
const isOwnEmptyingPane = (leafKey: string, subject: DragSubject): boolean =>
  leafKey === subject.fromKey && (subject.isGame || subject.loneWidget);

const compassZones = (laid: LaidOut, subject: DragSubject): DropZone[] => {
  const zones: DropZone[] = [];
  for (const { node, rect } of laid.leaves) {
    if (isOwnEmptyingPane(node.key, subject)) continue;
    const cx = rect.x + rect.width / 2 - COMPASS / 2;
    const cy = rect.y + rect.height / 2 - COMPASS / 2;
    const at = (dx: number, dy: number): Rect => ({ x: cx + dx, y: cy + dy, width: COMPASS, height: COMPASS });
    const offsets: Record<DockEdge, [number, number]> = { left: [-OFFSET, 0], right: [OFFSET, 0], top: [0, -OFFSET], bottom: [0, OFFSET] };
    for (const edge of EDGES) zones.push({ target: { at: 'leaf', key: node.key, edge }, hit: at(...offsets[edge]), preview: half(rect, edge), kind: 'compass' });
    if (node.kind === 'pane' && !subject.isGame) zones.push({ target: { at: 'tab', key: node.key }, hit: at(0, 0), preview: rect, kind: 'compass' });
    if (node.kind === 'game' && !subject.isGame) zones.push({ target: { at: 'float' }, hit: rect, preview: null, kind: 'float' });
  }
  return zones;
};

const dropZones = (laid: LaidOut, stage: Rect, subject: DragSubject): DropZone[] =>
  [...outerZones(stage, subject.isGame), ...compassZones(laid, subject)];

/** The zone under the pointer: strips and compasses first, then the picture, then the nearest edge of the leaf under it. */
const hitTarget = (point: { x: number; y: number }, zones: readonly DropZone[], laid: LaidOut, subject: DragSubject): DropZone | null => {
  const direct = zones.find((z) => z.kind !== 'float' && inRect(point, z.hit));
  if (direct) return direct;
  const float = zones.find((z) => z.kind === 'float' && inRect(point, z.hit));
  if (float) return float;
  for (const { node, rect } of laid.leaves) {
    if (!inRect(point, rect)) continue;
    if (isOwnEmptyingPane(node.key, subject)) return null;
    const dist: Record<DockEdge, number> = {
      left: point.x - rect.x, right: rect.x + rect.width - point.x, top: point.y - rect.y, bottom: rect.y + rect.height - point.y,
    };
    const edge = EDGES.reduce((best, e) => (dist[e] < dist[best] ? e : best), 'left' as DockEdge);
    return zones.find((z) => z.target.at === 'leaf' && z.target.key === node.key && z.target.edge === edge) ?? null;
  }
  return null;
};

export { COMPASS, OUTER, dropZones, hitTarget, inRect };
export type { DragSubject, DropZone };
