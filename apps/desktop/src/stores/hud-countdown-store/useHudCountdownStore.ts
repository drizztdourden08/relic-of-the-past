/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { advanceCountdown, IDLE_TRACK } from '@rotp/hud';
import type { HudCountdownStore } from './hud-countdown-store.type';

const useHudCountdownStore = create<HudCountdownStore>()((set, get) => ({
  track: IDLE_TRACK,
  advance: (reading) => {
    const next = advanceCountdown(get().track, reading);
    if (next !== get().track) set({ track: next });
  },
}));

export { useHudCountdownStore };
