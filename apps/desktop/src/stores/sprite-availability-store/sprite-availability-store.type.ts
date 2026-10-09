/* @layer renderer-stores @kind types */
interface SpriteAvailabilityState {
  romFile: string | null;
  available: boolean;
  revision: number;
}

interface SpriteAvailabilityStore extends SpriteAvailabilityState {
  setAvailability: (romFile: string, available: boolean) => void;
  noteSpritesRewritten: () => void;
}

export type { SpriteAvailabilityState, SpriteAvailabilityStore };
