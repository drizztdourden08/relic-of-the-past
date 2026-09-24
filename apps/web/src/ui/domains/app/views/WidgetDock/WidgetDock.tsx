/* @layer renderer-components @kind component */
/**
 * The view that owns the widget layout on screen: it reads the layout store,
 * strips the widgets the current app state hides, hands the rest to the
 * DockLayout composite, and gives every pane and floating widget its shell,
 * content and options panel. It fills `.app__content` behind the pages.
 */
import { useCallback, useMemo, useRef } from 'react';
import type { FloatingWidget, PaneNode, Rect, WidgetId } from '@shared/types/widget-layout';
import { DockLayout } from '@ds/composites/DockLayout';
import { useHeldActions } from '@app/hooks/useHeldActions';
import { useWidgetsNeverFocus } from '@app/hooks/useWidgetsNeverFocus';
import { useGameRectStore } from '@app/stores/game-rect-store';
import { useWidgetLayoutStore } from '@app/stores/widget-layout-store';
import { visibleLayoutOf } from './behavior/visible-layout';
import { DockPane, labelOf } from './sub-components/DockPane';
import { WidgetOptionsHost } from './sub-components/WidgetOptionsHost';
import type { WidgetDockProps } from './WidgetDock.type';
import './WidgetDock.css';

const WidgetDock = (props: WidgetDockProps) => {
  const {
    contents, gameRunning, pageOpen, developerToolsEnabled, vanillaSafe, settings, startupForcedWidgetIds, onOpenSettings,
  } = props;
  const layout = useWidgetLayoutStore((s) => s.layout);
  const peek = useWidgetLayoutStore((s) => s.peek);
  const optionsFor = useWidgetLayoutStore((s) => s.optionsFor);
  const apply = useWidgetLayoutStore((s) => s.apply);
  const popOut = useWidgetLayoutStore((s) => s.popOut);
  const setRect = useGameRectStore((s) => s.setRect);
  const modifiers = useHeldActions();
  useWidgetsNeverFocus();

  const contentIds = useMemo(() => Object.keys(contents), [contents]);
  const visibleLayout = useMemo(
    () => visibleLayoutOf(layout, { gameRunning, pageOpen, developerToolsEnabled, forcedIds: startupForcedWidgetIds, contentIds }),
    [layout, gameRunning, pageOpen, developerToolsEnabled, startupForcedWidgetIds, contentIds],
  );

  // Where each docked widget's pane landed in the last pass, for the options panel's dock edge.
  const paneRects = useRef(new Map<WidgetId, Rect>());

  const renderPane = useCallback((pane: PaneNode, rect: Rect) => {
    for (const id of pane.widgets) paneRects.current.set(id, rect);
    return (
      <DockPane
        widgets={pane.widgets}
        activeId={pane.active}
        paneKey={pane.key}
        content={contents[pane.active]}
        vanillaSafe={vanillaSafe}
        settings={settings}
        onOpenSettings={onOpenSettings}
      />
    );
  }, [contents, vanillaSafe, settings, onOpenSettings]);

  const renderFloating = useCallback((floating: FloatingWidget) => (
    <DockPane
      widgets={[floating.id]}
      activeId={floating.id}
      paneKey={null}
      content={contents[floating.id]}
      vanillaSafe={vanillaSafe}
      settings={settings}
      onOpenSettings={onOpenSettings}
    />
  ), [contents, vanillaSafe, settings, onOpenSettings]);

  return (
    <>
      <DockLayout
        className="widget-dock"
        layout={visibleLayout}
        peek={peek}
        modifiers={modifiers}
        renderPane={renderPane}
        renderFloating={renderFloating}
        onGameRect={setRect}
        onEdit={apply}
        onPopOut={popOut}
        labelOf={labelOf}
      />
      {optionsFor && (
        <WidgetOptionsHost
          id={optionsFor.id}
          anchor={optionsFor.anchor}
          paneRect={paneRects.current.get(optionsFor.id) ?? null}
        />
      )}
    </>
  );
};

export { WidgetDock };
