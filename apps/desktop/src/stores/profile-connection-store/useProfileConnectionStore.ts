/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { ProfileConnectionState } from './profile-connection-store.type';

const useProfileConnectionStore = create<ProfileConnectionState>((set) => ({
  saved: {},
  setSaved: (profileId, config) => set((state) => ({ saved: { ...state.saved, [profileId]: config } })),
}));

export { useProfileConnectionStore };
