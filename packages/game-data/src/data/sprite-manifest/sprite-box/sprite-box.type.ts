/* @layer shared-game @kind types */
interface SpriteBox { w: number; h: number }

interface ExtractShape {
  method?: string;
  tiles?: number[];
  width?: number;
  glyphRight?: number;
}

export type { ExtractShape, SpriteBox };
