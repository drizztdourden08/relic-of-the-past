/* @layer renderer-lib @kind types */
interface Msu1Audio {
  channels: Float32Array<ArrayBuffer>[];
  loopSample: number;
  sampleRate: number;
}

export type { Msu1Audio };
