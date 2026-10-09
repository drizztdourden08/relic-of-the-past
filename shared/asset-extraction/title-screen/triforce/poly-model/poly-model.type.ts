/* @layer shared-asset-extraction @kind types */
type Vertex = readonly [x: number, y: number, z: number];

interface PolyModel {
  vertices: Vertex[];
  faces: number[];
  faceCount: number;
  sinCos: number[];
}

interface PolyPose {
  a: number;
  b: number;
  distance: number;
  baseX: number;
  baseY: number;
}

export type { PolyModel, PolyPose, Vertex };
