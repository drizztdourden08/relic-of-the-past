/* @layer renderer-stores @kind logic */
/**
 * The randomizer config each profile was last saved with from a connection edit, by profile
 * id. The app's profile object is a snapshot from when it was loaded, so every screen that
 * shows or edits a connection (the Randomizer page, the profile's Online settings) reads the
 * saved config through here and sees the same values the moment one of them saves.
 * Never persisted: the profile file is the record, and the next load reads it from there.
 */
import { create } from 'zustand';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

interface ProfileConnectionState {
  saved: Readonly<Record<string, ProfileRandomizerConfig>>;
  setSaved: (profileId: string, config: ProfileRandomizerConfig) => void;
}

const useProfileConnectionStore = create<ProfileConnectionState>((set) => ({
  saved: {},
  setSaved: (profileId, config) => set((state) => ({ saved: { ...state.saved, [profileId]: config } })),
}));

export { useProfileConnectionStore };
export type { ProfileConnectionState };
