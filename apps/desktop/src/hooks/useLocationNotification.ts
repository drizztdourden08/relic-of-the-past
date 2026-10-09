/* @layer renderer-hud @kind hook */
import { useEffect, useRef } from 'react';
import { useGameUIStore } from '../stores/game-ui-store';
import { useLocationNotificationStore } from '../stores/location-notification-store';
import { resolveCurrentScreen } from '@rotp/game-data';
import type { ScreenRecord } from '@rotp/game-data';
import { NOTIFICATIONS_ENABLED, SCREEN_DISMISS_MS, TRANSITION_DISMISS_MS } from './hooks.constants';

const useLocationNotification = () => {
  const prevDetectedRef = useRef<ScreenRecord | null>(null);
  const prevRoomRef = useRef<number>(-1);
  const prevOwScreenRef = useRef<number>(-1);
  const screenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!NOTIFICATIONS_ENABLED) return;

    const unsub = useGameUIStore.subscribe((state, prevState) => {
      const map = state.map;
      const prevMap = prevState?.map;

      if (
        prevMap &&
        map.roomIndex === prevMap.roomIndex &&
        map.overworldScreenIndex === prevMap.overworldScreenIndex
      ) {
        return;
      }

      if (map.roomIndex === prevRoomRef.current && map.overworldScreenIndex === prevOwScreenRef.current) {
        return;
      }
      prevRoomRef.current = map.roomIndex;
      prevOwScreenRef.current = map.overworldScreenIndex;

      const store = useLocationNotificationStore.getState();

      if (!store.showScreen && !store.showTransition) return;

      const detected = resolveCurrentScreen(
        map.isIndoors,
        map.palaceIndex,
        map.roomIndex,
        map.overworldScreenIndex,
        map.whichEntrance,
      );

      if (!detected) return;

      const prev = prevDetectedRef.current;
      prevDetectedRef.current = detected;

      if (prev && prev.id === detected.id) return;

      if (store.showScreen && (!prev || prev.locationId !== detected.locationId)) {
        store.setScreen(detected);

        if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
        screenTimerRef.current = setTimeout(() => {
          useLocationNotificationStore.getState().clearScreen();
        }, SCREEN_DISMISS_MS);
      }

      if (store.showTransition && prev && prev.locationId === detected.locationId && prev.name !== detected.name) {
        const entrance = detected.name;
        store.setTransition(entrance);

        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(() => {
          useLocationNotificationStore.getState().clearTransition();
        }, TRANSITION_DISMISS_MS);
      }
    });

    return () => {
      unsub();
      if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);
};

export { useLocationNotification };
