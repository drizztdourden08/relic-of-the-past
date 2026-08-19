/* @layer renderer-components @kind component */
/**
 * WidgetManager — Layout engine for all widgets.
 *
 * Responsibilities:
 *  - Compute positions for docked widgets (stacked vertically on left/right, horizontally on top/bottom)
 *  - Render floating widgets at their absolute position
 *  - Filter widgets by visibility mode vs current app state (game-only vs always)
 *  - Provide update/close callbacks that propagate to store
 */
import { useMemo, useEffect } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../primitives/Box';
import { DisabledOverlay } from '../../DisabledOverlay';
import type { WidgetLayout, WidgetState } from '../Widget.type';
import { Widget } from '../Widget';
import { computeDockedStyles } from '../behavior/computeDockedStyles';
import type { ExclusiveInsets } from '../behavior/computeDockedStyles';
import { getWidgetDefinition } from '../behavior/createWidgetState';
import { resolveWidgetDisabledState } from '../behavior/resolveWidgetDisabledState';

interface WidgetManagerProps {
  layout: WidgetLayout;
  gameRunning: boolean;
  onUpdate: (id: string, patch: Partial<WidgetState>) => void;
  onClose: (id: string) => void;
  /** Notified when docked-widget exclusive insets change (wired to a store by a view). */
  onInsetsChange?: (insets: ExclusiveInsets) => void;
  /** Map of widget ID → content React node */
  children: Record<string, React.ReactNode>;
  /** Map of widget ID → settings content React node (optional, for widget-specific settings) */
  settingsContent?: Record<string, React.ReactNode>;
  /** Master gate for `devOnly` widgets (Widget.constants.ts) — hides them entirely when off. */
  developerToolsEnabled?: boolean;
  /** Widget ids force-opened via the `--widgets=` startup flag — always shown regardless of
   *  developerToolsEnabled, so the CLI-driven e2e baselines (tests/e2e/*.keep.spec.ts) that
   *  rely on it keep working in a fresh profile with dev tools off. */
  startupForcedWidgetIds?: string[];
  /** When true, `readsGameData` widgets (Widget.constants.ts) render behind a
   *  DisabledOverlay instead of their normal content — visible but non-interactive. */
  vanillaSafe?: boolean;
  /** Full settings snapshot, used to evaluate a widget's `requiresSetting` gate. */
  settings?: GameSettings | null;
  /** Deep-links to the setting responsible for a widget's lock; passed the setting's
   *  GameSettings key ('vanillaSafe', 'cheatsEnabled', ...) straight to the overlay's action. */
  onOpenSettings?: (settingId: string) => void;
}

const WidgetManager = (props: WidgetManagerProps) => {
  const {
    layout, gameRunning, onUpdate, onClose, onInsetsChange, children, settingsContent,
    developerToolsEnabled = false, startupForcedWidgetIds = [],
    vanillaSafe = false, settings = null, onOpenSettings = () => {},
  } = props;
  // Filter: only show widgets that are visible AND match the current visibility mode
  const activeWidgets = useMemo(() => {
    return layout.widgets.filter((w) => {
      if (!w.visible) return false;
      if (w.visibility === 'game-only' && !gameRunning) return false;
      if (getWidgetDefinition(w.id)?.devOnly && !developerToolsEnabled && !startupForcedWidgetIds.includes(w.id)) return false;
      return true;
    });
  }, [layout.widgets, gameRunning, developerToolsEnabled, startupForcedWidgetIds]);

  // Compute docked layout positions + exclusive insets
  const { styles: dockedStyles, exclusiveInsets } = useMemo(() => computeDockedStyles(activeWidgets), [activeWidgets]);

  // Publish exclusive insets upward so a view can broadcast them (e.g. to GameLayer).
  useEffect(() => {
    onInsetsChange?.(exclusiveInsets);
  }, [exclusiveInsets, onInsetsChange]);

  return (
    <Box className="widget-manager">
      {activeWidgets.map((w) => {
        const content = children[w.id];
        if (!content) return null;

        const disabled = resolveWidgetDisabledState(getWidgetDefinition(w.id), vanillaSafe, settings);

        return (
          <Widget
            key={w.id}
            state={w}
            onChange={(patch) => onUpdate(w.id, patch)}
            onClose={() => onClose(w.id)}
            dockedStyle={w.mode === 'docked' ? dockedStyles.get(w.id) : undefined}
            settingsContent={settingsContent?.[w.id]}
          >
            {/* `contained`: widget__content clips overflow (Widget.css), so the overlay's
             *  default overhang would get clipped at the pane's edges. */}
            <DisabledOverlay
              active={disabled != null}
              message={disabled?.message}
              contained
              onOpenSettings={() => onOpenSettings(disabled?.settingId ?? 'vanillaSafe')}
            >
              {content}
            </DisabledOverlay>
          </Widget>
        );
      })}
    </Box>
  );
}

export { WidgetManager };
