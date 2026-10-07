/* @layer renderer-stores @kind logic */
/**
 * Manages screen/transition notification state, fed by a subscription to
 * game-ui-store map changes.
 */

import { create } from 'zustand';
import type { ScreenRecord } from '@shared/game/data';

interface LocationNotification {
  screen: ScreenRecord;
  timestamp: number;
}

interface TransitionNotification {
  entrance: string;
  timestamp: number;
}

interface LocationNotificationStore {
  /** Currently visible screen notification (null = hidden) */
  screen: LocationNotification | null;
  /** Currently visible transition notification (null = hidden) */
  transition: TransitionNotification | null;
  /** Whether screen notifications are enabled */
  showScreen: boolean;
  /** Whether transition notifications are enabled */
  showTransition: boolean;

  setScreen: (screen: ScreenRecord) => void;
  setTransition: (entrance: string) => void;
  clearScreen: () => void;
  clearTransition: () => void;
  setSettings: (showScreen: boolean, showTransition: boolean) => void;
}

const useLocationNotificationStore = create<LocationNotificationStore>()((set) => ({
  screen: null,
  transition: null,
  showScreen: true,
  showTransition: true,

  setScreen: (screen) => set({ screen: { screen, timestamp: Date.now() } }),
  setTransition: (entrance) => set({ transition: { entrance, timestamp: Date.now() } }),
  clearScreen: () => set({ screen: null }),
  clearTransition: () => set({ transition: null }),
  setSettings: (showScreen, showTransition) => set({ showScreen, showTransition }),
}));

export { useLocationNotificationStore };
export type { LocationNotification, TransitionNotification };
