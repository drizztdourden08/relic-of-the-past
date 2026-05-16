/**
 * WidgetManager — Layout engine for all widgets.
 *
 * Responsibilities:
 *  - Compute positions for docked widgets (stacked vertically on left/right, horizontally on top/bottom)
 *  - Render floating widgets at their absolute position
 *  - Filter widgets by visibility mode vs current app state (game-only vs always)
 *  - Provide update/close callbacks that propagate to store
 */
import { useMemo, useCallback } from 'react';
import type { WidgetLayout, WidgetState, SnapSide } from './widget-types';
import { Widget } from './Widget';

const TITLEBAR_HEIGHT = 38; // pixels reserved for the app titlebar

interface WidgetManagerProps {
  layout: WidgetLayout;
  gameRunning: boolean;
  onUpdate: (id: string, patch: Partial<WidgetState>) => void;
  onClose: (id: string) => void;
  /** Map of widget ID → content React node */
  children: Record<string, React.ReactNode>;
  /** Map of widget ID → settings content React node (optional, for widget-specific settings) */
  settingsContent?: Record<string, React.ReactNode>;
}

export function WidgetManager({ layout, gameRunning, onUpdate, onClose, children, settingsContent }: WidgetManagerProps) {
  // Filter: only show widgets that are visible AND match the current visibility mode
  const activeWidgets = useMemo(() => {
    return layout.widgets.filter((w) => {
      if (!w.visible) return false;
      if (w.visibility === 'game-only' && !gameRunning) return false;
      return true;
    });
  }, [layout.widgets, gameRunning]);

  // Compute docked layout positions
  const dockedStyles = useMemo(() => computeDockedStyles(activeWidgets), [activeWidgets]);

  return (
    <div className="widget-manager">
      {activeWidgets.map((w) => {
        const content = children[w.id];
        if (!content) return null;

        return (
          <Widget
            key={w.id}
            state={w}
            onChange={(patch) => onUpdate(w.id, patch)}
            onClose={() => onClose(w.id)}
            dockedStyle={w.mode === 'docked' ? dockedStyles.get(w.id) : undefined}
            settingsContent={settingsContent?.[w.id]}
          >
            {content}
          </Widget>
        );
      })}
    </div>
  );
}

// ─── Docked layout computation ───

function computeDockedStyles(widgets: WidgetState[]): Map<string, React.CSSProperties> {
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

  return styles;
}
