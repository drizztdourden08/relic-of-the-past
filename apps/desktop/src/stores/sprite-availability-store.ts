/* @layer renderer-stores @kind logic */
/**
 * Sprite Availability Store — tracks whether the active ROM has extracted HUD
 * sprites. The enhanced "Vanilla" HUD style rebuilds the SNES look from these
 * PNGs (served over the app-sprite:// protocol); when they're missing the
 * settings lock Vanilla and the overlay shows a notice instead of broken images.
 * Updated whenever the active ROM changes (see applySpritesForRom).
 */
import { create } from 'zustand';

interface SpriteAvailabilityState {
  /** ROM file the flag refers to (null until the first check runs). */
  romFile: string | null;
  /** True when at least one sprite PNG is extracted for the active ROM. */
  available: boolean;
}

interface SpriteAvailabilityStore extends SpriteAvailabilityState {
  setAvailability: (romFile: string, available: boolean) => void;
}

const useSpriteAvailabilityStore = create<SpriteAvailabilityStore>()((set) => ({
  romFile: null,
  available: false,
  setAvailability: (romFile, available) => set({ romFile, available }),
}));

export { useSpriteAvailabilityStore };
export type { SpriteAvailabilityState };
