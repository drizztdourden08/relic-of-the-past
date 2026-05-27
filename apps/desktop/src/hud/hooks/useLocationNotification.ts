/**
 * useLocationNotification — subscribes to game-ui-store map changes
 * and fires region/transition notifications via location-notification-store.
 *
 * Call this once in GameOverlay (or a top-level provider) so the subscription
 * lives for the entire game session.
 */

import { useEffect, useRef } from 'react';
import { useGameUIStore } from '../../stores/game-ui-store';
import { useLocationNotificationStore } from '../../stores/location-notification-store';
import { resolveCurrentRegion } from '@shared/game/data/regions/detection';
import type { RegionDefinition } from '@shared/game/types';

/** Auto-dismiss delay in ms */
const REGION_DISMISS_MS = 3000;
const TRANSITION_DISMISS_MS = 2000;

function useLocationNotification() {
  const prevRegionRef = useRef<RegionDefinition | null>(null);
  const prevRoomRef = useRef<number>(-1);
  const prevScreenRef = useRef<number>(-1);
  const regionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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
      if (map.roomIndex === prevRoomRef.current && map.overworldScreenIndex === prevScreenRef.current) {
        return;
      }
      prevRoomRef.current = map.roomIndex;
      prevScreenRef.current = map.overworldScreenIndex;

      const store = useLocationNotificationStore.getState();

      // Skip if notifications are disabled
      if (!store.showRegion && !store.showTransition) return;

      // Resolve current region from game state
      const region = resolveCurrentRegion(
        map.isIndoors,
        map.palaceIndex,
        map.roomIndex,
        map.overworldScreenIndex,
      );

      if (!region) return;

      const prev = prevRegionRef.current;
      prevRegionRef.current = region;

      // Skip if same region
      if (prev && prev.id === region.id) return;

      // ─── Region notification ───
      // Only fire if displayName changed (same zone = no notification)
      if (store.showRegion && (!prev || prev.displayName !== region.displayName)) {
        store.setRegion(region);

        // Auto-dismiss
        if (regionTimerRef.current) clearTimeout(regionTimerRef.current);
        regionTimerRef.current = setTimeout(() => {
          useLocationNotificationStore.getState().clearRegion();
        }, REGION_DISMISS_MS);
      }

      // ─── Transition notification (subtitle change within same area) ───
      if (store.showTransition && prev && prev.displayName === region.displayName && prev.subtitle !== region.subtitle) {
        const entrance = region.subtitle ?? region.name;
        store.setTransition(entrance);

        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(() => {
          useLocationNotificationStore.getState().clearTransition();
        }, TRANSITION_DISMISS_MS);
      }
    });

    return () => {
      unsub();
      if (regionTimerRef.current) clearTimeout(regionTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);
}

export { useLocationNotification, REGION_DISMISS_MS, TRANSITION_DISMISS_MS };
