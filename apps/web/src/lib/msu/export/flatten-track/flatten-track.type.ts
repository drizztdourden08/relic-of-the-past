/* @layer renderer-lib @kind types */
interface FlattenOptions {
  seed?: number;
}

interface FlattenedTrack {
  channels: Float32Array[];
  loopSample: number;
}

export type { FlattenOptions, FlattenedTrack };
