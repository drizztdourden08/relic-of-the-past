/* @layer bridge-wasm @kind types */
interface LocalPoint {
  x: number;
  y: number;
}

interface NGonSpec {
  halfW: number;
  halfH: number;
  sides: number;
  cornerRadius: number;
}

export type { LocalPoint, NGonSpec };
