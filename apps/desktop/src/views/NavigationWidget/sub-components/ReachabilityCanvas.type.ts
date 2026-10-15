/* @layer renderer-widgets @kind types */
interface ReachBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

interface ReachabilityCanvasProps {
  reachable: number[][];
  size: number;
  bounds?: ReachBounds;
  tileLayer?: (0 | 1 | 2)[][];
}

export type { ReachabilityCanvasProps };
