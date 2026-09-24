/* @layer renderer-appshell @kind hook */
/**
 * Keeps the widgets' own OS windows in step with the layout: opens the ones a
 * loaded layout says are popped, docks a widget back when its window closes,
 * remembers where each window sits, and feeds every open one over the relay
 * with the state the shell owns (settings, profile, whether the game runs).
 */
import { useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { installWidgetPublisher, publishGameRunning, publishProfile, publishSettings } from '@app/lib/game/widget-data';
import { useWidgetLayoutStore } from '@app/stores/widget-layout-store';

interface PopOutWindowsParams {
  profileId: string | null;
  settings: GameSettings | null | undefined;
  gameRunning: boolean;
}

const usePopOutWindows = (params: PopOutWindowsParams): void => {
  const { profileId, settings, gameRunning } = params;
  const popped = useWidgetLayoutStore((s) => s.layout.popped);
  const dockBack = useWidgetLayoutStore((s) => s.dockBack);
  const setPoppedBounds = useWidgetLayoutStore((s) => s.setPoppedBounds);
  const opened = useRef(new Set<string>());

  useEffect(() => installWidgetPublisher(), []);
  useEffect(() => { if (settings) publishSettings(settings); }, [settings]);
  useEffect(() => { publishProfile(profileId); }, [profileId]);
  useEffect(() => { publishGameRunning(gameRunning); }, [gameRunning]);

  useEffect(() => {
    const offClosed = window.api.onWidgetClosed((id) => {
      opened.current.delete(id);
      if (useWidgetLayoutStore.getState().layout.popped.some((p) => p.id === id)) dockBack(id);
    });
    const offBounds = window.api.onWidgetBounds((id, bounds) => setPoppedBounds(id, bounds));
    return () => {
      offClosed();
      offBounds();
    };
  }, [dockBack, setPoppedBounds]);

  // A layout loaded with popped widgets reopens their windows once each; a window already
  // open is left alone so a layout save never steals the focus.
  useEffect(() => {
    for (const p of popped) {
      if (opened.current.has(p.id)) continue;
      opened.current.add(p.id);
      void window.api.popOutWidget(p.id, p.bounds);
    }
  }, [popped]);
};

export { usePopOutWindows };
