/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { TrackerPresenceState } from './tracker-presence-store.type';

const useTrackerPresenceStore = create<TrackerPresenceState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export { useTrackerPresenceStore };
