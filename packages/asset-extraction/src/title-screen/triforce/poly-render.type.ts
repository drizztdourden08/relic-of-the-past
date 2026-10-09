/* @layer shared-asset-extraction @kind types */
interface Rotation { sinA: number; cosA: number; sinB: number; cosB: number; e0: number; e1: number; e2: number; e3: number }

interface ProjectedVertices {
  xs: number[];
  ys: number[];
}

export type { ProjectedVertices, Rotation };
