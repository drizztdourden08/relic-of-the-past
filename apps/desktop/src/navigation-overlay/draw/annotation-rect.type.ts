/* @layer renderer-components @kind types */
interface AnnotationRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

interface AnnotationFootprint {
  sizeCols: number;
  sizeRows: number;
  nudgeCols: number;
  nudgeRows: number;
}

export type { AnnotationFootprint, AnnotationRect };
