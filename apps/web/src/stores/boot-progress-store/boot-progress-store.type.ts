/* @layer renderer-stores @kind types */
type BootPhase = 'idle' | 'glue' | 'fetch' | 'compile' | 'ready' | 'error';

interface BootProgressState {
  phase: BootPhase;
  message: string;
  ratio: number | null;
  update: (patch: Partial<Pick<BootProgressState, 'phase' | 'message' | 'ratio'>>) => void;
}

export type { BootPhase, BootProgressState };
