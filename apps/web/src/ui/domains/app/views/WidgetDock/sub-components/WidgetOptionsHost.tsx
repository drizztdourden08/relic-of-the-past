/* @layer renderer-components @kind component */
/**
 * The options panel for whichever widget asked for it, wired to the layout
 * store, with the widget's own settings rows as children.
 */
import { useCallback } from 'react';
import type { DockEdge, Rect, WidgetFrame, WidgetId } from '@shared/types/widget-layout';
import { paneOf } from '@ds/composites/DockLayout/behavior/edit-tree';
import { WidgetOptions } from '@ds/composites/Widget/sub-components/WidgetOptions';
import { getWidgetDefinition } from '@ds/composites/Widget/behavior/createWidgetState';
import { WIDGET_SETTINGS_CONTENT } from '@domains/widgets';
import { frameOf, placementOf } from '@app/stores/widget-layout-edits';
import { useWidgetLayoutStore } from '@app/stores/widget-layout-store';
import { useGameRectStore } from '@app/stores/game-rect-store';
import { labelOf } from './DockPane';

interface WidgetOptionsHostProps {
  id: WidgetId;
  anchor: Rect;
  /** The pane's rectangle while docked, from the last layout pass. */
  paneRect: Rect | null;
}

/** The edge a docked pane sits on, judged against the play area; undefined when it is beside no single edge. */
const edgeOf = (pane: Rect | null, game: Rect | null): DockEdge | undefined => {
  if (!pane || !game) return undefined;
  if (pane.x + pane.width <= game.x) return 'left';
  if (pane.x >= game.x + game.width) return 'right';
  if (pane.y + pane.height <= game.y) return 'top';
  if (pane.y >= game.y + game.height) return 'bottom';
  return undefined;
};

const WidgetOptionsHost = (props: WidgetOptionsHostProps) => {
  const { id, anchor, paneRect } = props;
  const layout = useWidgetLayoutStore((s) => s.layout);
  const gameRect = useGameRectStore((s) => s.rect);
  const dock = useWidgetLayoutStore((s) => s.dock);
  const float = useWidgetLayoutStore((s) => s.float);
  const popOut = useWidgetLayoutStore((s) => s.popOut);
  const setMakeRoom = useWidgetLayoutStore((s) => s.setMakeRoom);
  const setFrame = useWidgetLayoutStore((s) => s.setFrame);
  const resetWidget = useWidgetLayoutStore((s) => s.resetWidget);
  const closeOptions = useWidgetLayoutStore((s) => s.closeOptions);

  const placement = placementOf(layout, id) ?? 'docked';
  const frame = frameOf(layout, id);
  const makeRoom = paneOf(layout.dock, id)?.makeRoom ?? true;

  const handleDock = useCallback((edge: DockEdge) => dock(id, edge), [dock, id]);
  const handleFloat = useCallback(() => float(id), [float, id]);
  const handlePopOut = useCallback(() => popOut(id), [popOut, id]);
  const handleMakeRoom = useCallback((value: boolean) => setMakeRoom(id, value), [setMakeRoom, id]);
  const handleOpacity = useCallback((value: number) => setFrame(id, { opacity: value }), [setFrame, id]);
  const handleShow = useCallback((value: WidgetFrame['show']) => setFrame(id, { show: value }), [setFrame, id]);
  const handleReset = useCallback(() => resetWidget(id), [resetWidget, id]);

  return (
    <WidgetOptions
      title={labelOf(id)}
      placement={placement}
      dockEdge={placement === 'docked' ? edgeOf(paneRect, gameRect) : undefined}
      makeRoom={makeRoom}
      opacity={frame.opacity}
      show={frame.show}
      anchorRect={anchor}
      onDock={handleDock}
      onFloat={handleFloat}
      onPopOut={handlePopOut}
      canPopOut={getWidgetDefinition(id)?.popOut === true}
      onMakeRoomChange={handleMakeRoom}
      onOpacityChange={handleOpacity}
      onShowChange={handleShow}
      onReset={handleReset}
      onClose={closeOptions}
    >
      {WIDGET_SETTINGS_CONTENT[id]}
    </WidgetOptions>
  );
};

export { WidgetOptionsHost, edgeOf };
export type { WidgetOptionsHostProps };
