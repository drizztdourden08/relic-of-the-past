/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { LocationNotificationStore } from './location-notification-store.type';

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
