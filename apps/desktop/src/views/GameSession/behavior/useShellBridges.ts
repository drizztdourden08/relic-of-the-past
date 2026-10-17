/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { nav, useBootStore, useSetAppContext, widgets } from '@drizztdourden08/brock-react';
import { useDataViewStore } from '@app/stores/data-view-store';
import { startupWidgets } from '@app/startup/startup-widgets';
import { GAME_CONTEXT, DATA_INSPECTOR_SCREEN } from '../GameSession.constants';
import { useNavigationOverlayFollowsWidget } from './useNavigationOverlayFollowsWidget';

const useShellBridges = (isGameRunning: boolean): void => {
  useSetAppContext(GAME_CONTEXT, isGameRunning);
  useNavigationOverlayFollowsWidget();
  const registerInspectorOpener = useDataViewStore((state) => state.registerInspectorOpener);
  const ready = useBootStore((s) => s.phase === 'ready');
  const opened = useRef(false);

  useEffect(() => {
    registerInspectorOpener(() => nav.open(DATA_INSPECTOR_SCREEN));
    return () => registerInspectorOpener(null);
  }, [registerInspectorOpener]);

  useEffect(() => {
    if (!ready || opened.current) return;
    opened.current = true;
    const ids = startupWidgets();
    if (ids.length > 0) widgets.force(ids);
  }, [ready]);
};

export { useShellBridges };
