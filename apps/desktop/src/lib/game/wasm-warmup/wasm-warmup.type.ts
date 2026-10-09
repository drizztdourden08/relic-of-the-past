/* @layer bridge-wasm @kind types */
type WarmReport = (patch: { phase?: string; message?: string; ratio?: number | null }) => void;

type ByteProgress = (ratio: number) => void;

interface WarmupState {
  compiledModule: WebAssembly.Module | null;
  cachedBytes: ArrayBuffer | null;
  warmPromise: Promise<void> | null;
  gluePromise: Promise<void> | null;
}

export type { ByteProgress, WarmReport, WarmupState };
