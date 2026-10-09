/* @layer bridge-wasm @kind types */
interface LightUniforms {
  numLights: number;
  positions: Float32Array;
  colors: Float32Array;
  intensities: Float32Array;
  castShadows: Float32Array;
}

type Rgb = [number, number, number];

export type { LightUniforms, Rgb };
