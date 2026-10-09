/* @layer renderer-stores @kind types */
import type { DialogFrame } from '@rotp/game-data';

interface DialogStore {
  frame: DialogFrame;
  stale: boolean;
  staleGeneration: number;
  _setFrame: (frame: DialogFrame) => void;
  markStale: () => void;
  markRestored: () => void;
}

export type { DialogStore };
