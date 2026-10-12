/* @layer renderer-stores @kind logic */
/**
 * The HUD countdown as the overlay draws it: the live reading plus the length it started from.
 * It lives in a store so the length outlasts the HUD, which unmounts on the map screens.
 */
import { create } from 'zustand';
import { advanceCountdown, IDLE_TRACK } from '../lib/game/hud-countdown-track';
import type { CountdownReading, CountdownTrack } from '../lib/game/hud-countdown-track';

interface HudCountdownStore {
  track: CountdownTrack;
  /** Feed one reading. The track object changes only when the reading moved it. */
  advance: (reading: CountdownReading) => void;
}

const useHudCountdownStore = create<HudCountdownStore>()((set, get) => ({
  track: IDLE_TRACK,
  advance: (reading) => {
    const next = advanceCountdown(get().track, reading);
    if (next !== get().track) set({ track: next });
  },
}));

export { useHudCountdownStore };
