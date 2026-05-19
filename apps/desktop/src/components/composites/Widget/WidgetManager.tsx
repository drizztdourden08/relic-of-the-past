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
import type { WidgetLayout, WidgetState } from './types';
import { Widget } from './Widget';
import { computeDockedStyles } from './behavior/computeDockedStyles';

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

const WidgetManager = (props: WidgetManagerProps) => {
  const { layout, gameRunning, onUpdate, onClose, children, settingsContent } = props;
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

export { WidgetManager };
