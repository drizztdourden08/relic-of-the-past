/**
 * Location Notification Store — manages region/transition notification state.
 * Fed by a subscription to game-ui-store map changes.
 */

import { create } from 'zustand';
import type { RegionDefinition } from '@shared/game/types';

interface LocationNotification {
  region: RegionDefinition;
  timestamp: number;
}

interface TransitionNotification {
  entrance: string;
  timestamp: number;
}

interface LocationNotificationStore {
  /** Currently visible region notification (null = hidden) */
  region: LocationNotification | null;
  /** Currently visible transition notification (null = hidden) */
  transition: TransitionNotification | null;
  /** Whether region notifications are enabled */
  showRegion: boolean;
  /** Whether transition notifications are enabled */
  showTransition: boolean;

  setRegion: (region: RegionDefinition) => void;
  setTransition: (entrance: string) => void;
  clearRegion: () => void;
  clearTransition: () => void;
  setSettings: (showRegion: boolean, showTransition: boolean) => void;
}

const useLocationNotificationStore = create<LocationNotificationStore>()((set) => ({
  region: null,
  transition: null,
  showRegion: true,
  showTransition: true,

  setRegion: (region) => set({ region: { region, timestamp: Date.now() } }),
  setTransition: (entrance) => set({ transition: { entrance, timestamp: Date.now() } }),
  clearRegion: () => set({ region: null }),
  clearTransition: () => set({ transition: null }),
  setSettings: (showRegion, showTransition) => set({ showRegion, showTransition }),
}));

export { useLocationNotificationStore };
export type { LocationNotification, TransitionNotification };
