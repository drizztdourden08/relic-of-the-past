/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { LobbyStatusState } from './lobby-status-store.type';

const without = <T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> => {
  const { [key]: _gone, ...rest } = record;
  return rest;
};

const useLobbyStatusStore = create<LobbyStatusState>((set) => ({
  members: {},
  live: {},
  setMember: (profileId, membership) => set((state) => ({ members: { ...state.members, [profileId]: membership } })),
  setLive: (profileId, live) => set((state) => ({ live: { ...state.live, [profileId]: live } })),
  drop: (profileId) => set((state) => ({ members: without(state.members, profileId), live: without(state.live, profileId) })),
}));

export { useLobbyStatusStore };
