/* @layer shared-game @kind types */
interface Extent {
  from: number;
  to: number;
}

interface MaskBox {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type { Extent, MaskBox };
