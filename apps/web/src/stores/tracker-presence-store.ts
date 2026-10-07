/* @layer renderer-stores @kind logic */
/**
 * Whether the checks tracker widget is on screen right now. The widget reports it while it is
 * mounted; the check toasts read it to follow their own "also while it is closed" setting.
 * Never persisted: it is a fact about this moment.
 */
import { create } from 'zustand';

interface TrackerPresenceState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const useTrackerPresenceStore = create<TrackerPresenceState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export { useTrackerPresenceStore };
export type { TrackerPresenceState };
