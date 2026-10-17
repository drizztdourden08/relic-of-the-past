/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { useWidgetLayoutStore } from '@drizztdourden08/brock-react';
import { isWidgetOpen } from '@drizztdourden08/tessera/composites';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';
import { NAVIGATION_WIDGET_ID } from '../GameSession.constants';

const useNavigationOverlayFollowsWidget = (): void => {
  const open = useWidgetLayoutStore((state) => isWidgetOpen(state.layout, NAVIGATION_WIDGET_ID));

  useEffect(() => {
    if (!open) useNavigationOverlayStore.getState().clear();
  }, [open]);
};

export { useNavigationOverlayFollowsWidget };
