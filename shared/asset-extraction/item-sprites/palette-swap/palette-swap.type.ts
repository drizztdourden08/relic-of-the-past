/* @layer shared-asset-extraction @kind types */
interface ColorSwap {
  from: string;
  to: string;
}

interface PaletteSwapDef {
  baseFile: string;
  colors: ColorSwap[];
}

export type { ColorSwap, PaletteSwapDef };
