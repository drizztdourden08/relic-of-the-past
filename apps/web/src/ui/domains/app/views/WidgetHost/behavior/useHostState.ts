/* @layer renderer-components @kind hook */
/** The shell-owned state a widget's own window receives from the main window: settings, profile, game. */
import { useEffect, useState } from 'react';
import { getHostState, installWidgetReceiver, onHostState, type HostState } from '@app/lib/game/widget-data';

const useHostState = (widgetId: string): HostState => {
  const [state, setState] = useState<HostState>(getHostState);

  useEffect(() => {
    const offState = onHostState(setState);
    const offRelay = installWidgetReceiver(widgetId);
    return () => {
      offState();
      offRelay();
    };
  }, [widgetId]);

  return state;
};

export { useHostState };
