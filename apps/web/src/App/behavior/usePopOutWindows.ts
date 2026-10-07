/* @layer renderer-appshell @kind hook */
/**
 * Keeps the widgets' own OS windows in step with the layout: opens the ones a
 * loaded layout says are popped, puts a widget back when its window closes,
 * remembers where each window sits and how it is pinned, follows a window
 * dragged over the app so the dock can take it back, and feeds every open one
 * over the relay with the state the shell owns (settings, profile, whether the
 * game runs, the widget frames).
 */
import { useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import {
  installWidgetPublisher, publishFrames, publishGameRunning, publishProfile, publishSettings,
} from '@app/lib/game/widget-data';
import { useWidgetLayoutStore } from '@app/stores/widget-layout-store';

interface PopOutWindowsParams {
  profileId: string | null;
  settings: GameSettings | null | undefined;
  gameRunning: boolean;
}

const usePopOutWindows = (params: PopOutWindowsParams): void => {
  const { profileId, settings, gameRunning } = params;
  const popped = useWidgetLayoutStore((s) => s.layout.popped);
  const frames = useWidgetLayoutStore((s) => s.layout.frame);
  const opened = useRef(new Set<string>());

  useEffect(() => installWidgetPublisher(), []);
  useEffect(() => { if (settings) publishSettings(settings); }, [settings]);
  useEffect(() => { publishProfile(profileId); }, [profileId]);
  useEffect(() => { publishGameRunning(gameRunning); }, [gameRunning]);
  useEffect(() => { publishFrames(frames); }, [frames]);

  useEffect(() => {
    const store = () => useWidgetLayoutStore.getState();
    const isPopped = (id: string): boolean => store().layout.popped.some((p) => p.id === id);
    const offs = [
      window.api.onWidgetClosed((id, where) => {
        opened.current.delete(id);
        if (isPopped(id)) store().dockBack(id, where);
      }),
      window.api.onWidgetBounds((id, bounds) => store().setPoppedBounds(id, bounds)),
      window.api.onWidgetPopped((id, patch) => { if (isPopped(id)) store().setPopped(id, patch); }),
      window.api.onWidgetFrame((id, patch) => store().setFrame(id, patch)),
      window.api.onWidgetDragOver((id, point) => store().setExternalDrag(point ? { id, point, released: false } : null)),
      window.api.onWidgetDropIn((id, point) => store().setExternalDrag({ id, point, released: true })),
    ];
    return () => { for (const off of offs) off(); };
  }, []);

  // A layout loaded with popped widgets reopens their windows once each; a window already
  // open is left alone so a layout save never steals the focus.
  useEffect(() => {
    for (const p of popped) {
      if (opened.current.has(p.id)) continue;
      opened.current.add(p.id);
      const { id, ...rest } = p;
      void window.api.popOutWidget(id, rest);
    }
  }, [popped]);
};

export { usePopOutWindows };
