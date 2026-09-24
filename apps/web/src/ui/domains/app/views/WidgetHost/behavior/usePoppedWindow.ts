/* @layer renderer-components @kind hook */
/**
 * The window facts a widget's own window shows and changes: its pin mode,
 * whether it is on top right now, and whether it snaps. Read once from the
 * main process, then kept fresh by its pushes.
 */
import { useCallback, useEffect, useState } from 'react';
import type { PinMode, PoppedWindowState } from '@shared/types/widget-layout';

const INITIAL: PoppedWindowState = { pin: 'off', onTop: false, snap: true, link: null };

const usePoppedWindow = (widgetId: string) => {
  const [state, setState] = useState<PoppedWindowState>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    void window.api.getWidgetWindowState(widgetId).then((s) => { if (s && !cancelled) setState(s); });
    const off = window.api.onWidgetWindowState(setState);
    return () => {
      cancelled = true;
      off();
    };
  }, [widgetId]);

  const setPin = useCallback((mode: PinMode) => { void window.api.setWidgetPin(widgetId, mode); }, [widgetId]);
  const setSnap = useCallback((on: boolean) => window.api.setWidgetSnap(widgetId, on), [widgetId]);

  return { ...state, setPin, setSnap };
};

export { usePoppedWindow };
