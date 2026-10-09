/* @layer bridge-wasm @kind types */
interface OriginalSound {
  buffer: AudioBuffer;
  audible: boolean;
}

interface PlayOutcome {
  started: boolean;
  silent: boolean;
}

export type { OriginalSound, PlayOutcome };
