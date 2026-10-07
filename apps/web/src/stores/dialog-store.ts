/* @layer renderer-stores @kind logic */
/**
 * The message box as the core's dialog mirror reports it, updated by the dialog bridge whenever
 * it changes. `stale` is raised on a save-state load that brought no dialog hook state: the mirror
 * cannot see what the loaded WRAM put on screen, so the host box holds back until the next message
 * clears it. A load that put the mirror back (state-dialog.ts) lowers it instead.
 */
import { create } from 'zustand';
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';
import { INACTIVE_FRAME } from '../lib/game/dialog/parse-dialog-state';
import { wasmDialogMarkStale } from '../lib/game/bridge/dialog';

interface DialogStore {
  frame: DialogFrame;
  stale: boolean;
  /** The mirror generation seen at the load; the mirror is trusted again once it moves on. */
  staleGeneration: number;
  _setFrame: (frame: DialogFrame) => void;
  markStale: () => void;
  /** The load restored the mirror itself, so the next frame read is the loaded message as it was saved. */
  markRestored: () => void;
}

const useDialogStore = create<DialogStore>()((set, get) => ({
  frame: INACTIVE_FRAME,
  stale: false,
  staleGeneration: 0,
  _setFrame: (frame) => {
    const { stale, staleGeneration } = get();
    // A box that closes, or a message the engine started after the load, is clearly seen again.
    const fresh = !frame.active || frame.generation !== staleGeneration;
    set({ frame, stale: stale && !fresh });
  },
  markStale: () => {
    wasmDialogMarkStale();
    set({ stale: true, staleGeneration: get().frame.generation });
  },
  markRestored: () => set({ stale: false }),
}));

export { useDialogStore };
