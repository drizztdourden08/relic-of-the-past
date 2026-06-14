/* @layer renderer-components @kind logic */
import type { WidgetState, SnapSide } from '../Widget.type';
import { TITLEBAR_HEIGHT } from '../Widget.constants';

/** Insets claimed by exclusive docked widgets (pixels) */
interface ExclusiveInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface DockedLayoutResult {
  styles: Map<string, React.CSSProperties>;
  exclusiveInsets: ExclusiveInsets;
}

const computeDockedStyles = (widgets: WidgetState[]): DockedLayoutResult => {
  const styles = new Map<string, React.CSSProperties>();

  // Group docked widgets by side, sorted by order
  const sides: Record<SnapSide, WidgetState[]> = { left: [], right: [], top: [], bottom: [] };
  for (const w of widgets) {
    if (w.mode === 'docked') {
      sides[w.side].push(w);
    }
  }
  for (const side of Object.keys(sides) as SnapSide[]) {
    sides[side].sort((a, b) => a.order - b.order);
  }

  // Compute reserved space: uniform size per side (max of all widgets on that side)
  const topHeight = sides.top.length > 0 ? Math.max(...sides.top.map((w) => w.dockedSize)) : 0;
  const bottomHeight = sides.bottom.length > 0 ? Math.max(...sides.bottom.map((w) => w.dockedSize)) : 0;
  const leftWidth = sides.left.length > 0 ? Math.max(...sides.left.map((w) => w.dockedSize)) : 0;
  const rightWidth = sides.right.length > 0 ? Math.max(...sides.right.map((w) => w.dockedSize)) : 0;

  // Compute exclusive insets: only count sides that have at least one exclusive widget
  const exclusiveInsets: ExclusiveInsets = {
    left: sides.left.some((w) => w.exclusive) ? leftWidth : 0,
    right: sides.right.some((w) => w.exclusive) ? rightWidth : 0,
    top: sides.top.some((w) => w.exclusive) ? topHeight : 0,
    bottom: sides.bottom.some((w) => w.exclusive) ? bottomHeight : 0,
  };

  // Left/Right: stack vertically, uniform width (max of all on that side)
  for (const side of ['left', 'right'] as const) {
    const group = sides[side];
    if (group.length === 0) continue;

    const uniformWidth = Math.max(...group.map((w) => w.dockedSize));
    const availableHeight = `calc(100vh - ${TITLEBAR_HEIGHT}px - ${topHeight}px - ${bottomHeight}px)`;
    const offsetExpr = `${TITLEBAR_HEIGHT + topHeight}px`;

    for (let i = 0; i < group.length; i++) {
      const heightExpr = `calc(${availableHeight} / ${group.length})`;
      const style: React.CSSProperties = {
        position: 'fixed',
        [side]: 0,
        top: i === 0 ? offsetExpr : `calc(${offsetExpr} + ${i} * ${availableHeight} / ${group.length})`,
        width: uniformWidth,
        height: heightExpr,
      };
      styles.set(group[i].id, style);
    }
  }

  // Top/Bottom: stack horizontally, uniform height (max of all on that side)
  for (const side of ['top', 'bottom'] as const) {
    const group = sides[side];
    if (group.length === 0) continue;

    const uniformHeight = Math.max(...group.map((w) => w.dockedSize));
    const availableWidth = `calc(100vw - ${leftWidth}px - ${rightWidth}px)`;
    const leftOffset = `${leftWidth}px`;

    for (let i = 0; i < group.length; i++) {
      const widthExpr = `calc(${availableWidth} / ${group.length})`;
      const style: React.CSSProperties = {
        position: 'fixed',
        left: i === 0 ? leftOffset : `calc(${leftOffset} + ${i} * ${availableWidth} / ${group.length})`,
        [side === 'top' ? 'top' : 'bottom']: side === 'top' ? TITLEBAR_HEIGHT : 0,
        width: widthExpr,
        height: uniformHeight,
      };
      styles.set(group[i].id, style);
    }
  }

  return { styles, exclusiveInsets };
};

export { computeDockedStyles };
export type { ExclusiveInsets, DockedLayoutResult };
