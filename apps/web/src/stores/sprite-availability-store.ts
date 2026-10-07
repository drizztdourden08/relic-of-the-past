/* @layer renderer-stores @kind logic */
/**
 * Sprite Availability Store: tracks whether the active ROM has extracted HUD
 * sprites. The enhanced "Vanilla" HUD style rebuilds the SNES look from these
 * PNGs (served over the app-sprite:// protocol); when they're missing the
 * settings lock Vanilla and the overlay shows a notice instead of broken images.
 * Updated whenever the active ROM changes (see applySpritesForRom).
 *
 * `revision` covers what the boolean cannot say: a set that was ALREADY
 * available and has since been rewritten in place by a background
 * re-extraction. The flag does not move on that (available before, available
 * after), so nothing keyed on it would re-render and every image loaded during
 * the rewrite would keep the failure it latched. Bumping the revision is the
 * one signal that the files behind the same names are new.
 */
import { create } from 'zustand';

interface SpriteAvailabilityState {
  /** ROM file the flag refers to (null until the first check runs). */
  romFile: string | null;
  /** True when at least one sprite PNG is extracted for the active ROM. */
  available: boolean;
  /** Times the ROM's set has been rewritten this session; 0 = as it was found. */
  revision: number;
}

interface SpriteAvailabilityStore extends SpriteAvailabilityState {
  setAvailability: (romFile: string, available: boolean) => void;
  noteSpritesRewritten: () => void;
}

const useSpriteAvailabilityStore = create<SpriteAvailabilityStore>()((set) => ({
  romFile: null,
  available: false,
  revision: 0,
  setAvailability: (romFile, available) => set({ romFile, available }),
  noteSpritesRewritten: () => set((state) => ({ revision: state.revision + 1 })),
}));

export { useSpriteAvailabilityStore };
export type { SpriteAvailabilityState };
