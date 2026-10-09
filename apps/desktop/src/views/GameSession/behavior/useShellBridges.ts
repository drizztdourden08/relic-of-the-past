/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { nav, useBootStore, useSetAppContext, widgets } from '@drizztdourden08/brock-react';
import { useDataViewStore } from '@app/stores/data-view-store';
import { startupWidgets } from '@app/lib/startup/startup-widgets';
import { GAME_CONTEXT, DATA_INSPECTOR_SCREEN } from '../GameSession.constants';

const useShellBridges = (isGameRunning: boolean): void => {
  useSetAppContext(GAME_CONTEXT, isGameRunning);
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
    for (const id of startupWidgets()) widgets.open(id);
  }, [ready]);
};

export { useShellBridges };
