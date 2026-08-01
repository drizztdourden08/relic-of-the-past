/* @layer renderer-hud @kind hook */
/**
 * useLocationNotification — subscribes to game-ui-store map changes
 * and fires screen/transition notifications via location-notification-store.
 *
 * Call this once in GameOverlay (or a top-level provider) so the subscription
 * lives for the entire game session.
 */

import { useEffect, useRef } from 'react';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { useLocationNotificationStore } from '../../../../stores/location-notification-store';
import { resolveCurrentScreen } from '@shared/game/logic/queries/detection';
import type { ScreenRecord } from '@shared/game/data';

/** Auto-dismiss delay in ms */
const SCREEN_DISMISS_MS = 3000;
const TRANSITION_DISMISS_MS = 2000;

/**
 * Location notifications belong to the in-progress navigation feature.
 * Suppressed for now — flip to true to re-enable when the feature ships.
 */
const NOTIFICATIONS_ENABLED: boolean = false;

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

      // Only process if room or screen actually changed
      if (
        prevMap &&
        map.roomIndex === prevMap.roomIndex &&
        map.overworldScreenIndex === prevMap.overworldScreenIndex
      ) {
        return;
      }

      // Deduplicate against ref (for initial mount / rapid re-renders)
      if (map.roomIndex === prevRoomRef.current && map.overworldScreenIndex === prevOwScreenRef.current) {
        return;
      }
      prevRoomRef.current = map.roomIndex;
      prevOwScreenRef.current = map.overworldScreenIndex;

      const store = useLocationNotificationStore.getState();

      // Skip if notifications are disabled
      if (!store.showScreen && !store.showTransition) return;

      // Resolve current screen from game state
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

      // Skip if same screen
      if (prev && prev.id === detected.id) return;

      // ─── Screen notification ───
      // Only fire if location changed (same zone = no notification)
      if (store.showScreen && (!prev || prev.locationId !== detected.locationId)) {
        store.setScreen(detected);

        // Auto-dismiss
        if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
        screenTimerRef.current = setTimeout(() => {
          useLocationNotificationStore.getState().clearScreen();
        }, SCREEN_DISMISS_MS);
      }

      // ─── Transition notification (name change within same location) ───
      if (store.showTransition && prev && prev.locationId === detected.locationId && prev.randomizerName !== detected.randomizerName) {
        const entrance = detected.vanillaName ?? detected.randomizerName;
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

export { useLocationNotification, SCREEN_DISMISS_MS, TRANSITION_DISMISS_MS };
