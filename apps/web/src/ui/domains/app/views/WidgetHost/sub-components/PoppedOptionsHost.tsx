/* @layer renderer-components @kind component */
/**
 * The options panel of a widget in its own window. Placement goes back into
 * the app through the main process; the pin and snapping are the window's
 * own; the frame is sent to the main window, which keeps it and publishes it
 * back; the widget's own rows come from the same content as inside the app.
 */
import { useCallback } from 'react';
import type { DockEdge, PinMode, Rect, WidgetFrame, WidgetId } from '@shared/types/widget-layout';
import { WidgetOptions } from '@ds/composites/Widget/sub-components/WidgetOptions';
import { WIDGET_SETTINGS_CONTENT } from '@domains/widgets';

interface PoppedOptionsHostProps {
  id: WidgetId;
  title: string;
  anchor: Rect;
  frame: WidgetFrame;
  pin: PinMode;
  snap: boolean;
  onPinChange: (mode: PinMode) => void;
  onSnapChange: (on: boolean) => void;
  onClose: () => void;
}

const DEFAULT_OPACITY = 0.92;

const PoppedOptionsHost = (props: PoppedOptionsHostProps) => {
  const { id, title, anchor, frame, pin, snap, onPinChange, onSnapChange, onClose } = props;

  const handleDock = useCallback((edge: DockEdge) => window.api.dockBackWidget(id, edge), [id]);
  const handleFloat = useCallback(() => window.api.dockBackWidget(id, 'float'), [id]);
  const handlePopIn = useCallback(() => window.api.dockBackWidget(id), [id]);
  const handleOpacity = useCallback((value: number) => window.api.setWidgetFrame(id, { opacity: value }), [id]);
  const handleReset = useCallback(() => {
    window.api.setWidgetFrame(id, { opacity: DEFAULT_OPACITY });
    onPinChange('off');
    onSnapChange(true);
  }, [id, onPinChange, onSnapChange]);
  const noop = useCallback(() => {}, []);

  return (
    <WidgetOptions
      title={title}
      placement="popped"
      makeRoom={false}
      opacity={frame.opacity}
      show={frame.show}
      anchorRect={anchor}
      onDock={handleDock}
      onFloat={handleFloat}
      onPopOut={handlePopIn}
      pin={pin}
      onPinChange={onPinChange}
      snap={snap}
      onSnapChange={onSnapChange}
      onMakeRoomChange={noop}
      onOpacityChange={handleOpacity}
      onShowChange={noop}
      onReset={handleReset}
      onClose={onClose}
    >
      {WIDGET_SETTINGS_CONTENT[id]}
    </WidgetOptions>
  );
};

export { PoppedOptionsHost };
export type { PoppedOptionsHostProps };
