/* @layer renderer-components @kind hook */
import { useEffect, useMemo } from 'react';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { echoOf } from './echo-of';
import type { HudFlexContainer } from '@rotp/hud';
import type { FlexSelection } from '../FlexEditor.type';

const useFlexEcho = (container: HudFlexContainer, selection: FlexSelection): void => {
  const setFlexEcho = useHudEditorViewStore((s) => s.setFlexEcho);
  const echo = useMemo(() => echoOf(container, selection), [container, selection]);
  useEffect(() => {
    setFlexEcho(echo);
    return () => setFlexEcho(null);
  }, [echo, setFlexEcho]);
};

export { useFlexEcho };
