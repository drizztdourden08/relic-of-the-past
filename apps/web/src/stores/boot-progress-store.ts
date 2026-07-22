/* @layer renderer-stores @kind logic */
/**
 * Boot-progress store — broadcasts the background game-core warmup progress
 * (glue script → .wasm fetch → compile) to the BootProgressBar view. The warmup
 * facade (lib/game/wasm-warmup) reports here; the bar observes. Keeps warmup
 * logic out of React and the bar purely presentational.
 */
import { create } from 'zustand';

type BootPhase = 'idle' | 'glue' | 'fetch' | 'compile' | 'ready' | 'error';

interface BootProgressState {
  phase: BootPhase;
  message: string;
  /** 0..1 for a determinate bar; null renders an indeterminate sweep. */
  ratio: number | null;
  update: (patch: Partial<Pick<BootProgressState, 'phase' | 'message' | 'ratio'>>) => void;
}

const useBootProgressStore = create<BootProgressState>((set) => ({
  phase: 'idle',
  message: '',
  ratio: null,
  update: (patch) => set(patch),
}));

export { useBootProgressStore };
export type { BootPhase, BootProgressState };
