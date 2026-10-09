/* @layer renderer-components @kind types */
interface NoiseTracker {
  prev: Uint8Array;
  counts: Uint32Array;
  frames: number;
  noisy: Set<number>;
}

export type { NoiseTracker };
