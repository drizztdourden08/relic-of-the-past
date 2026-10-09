/* @layer renderer-stores @kind types */
interface TrackerPresenceState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export type { TrackerPresenceState };
